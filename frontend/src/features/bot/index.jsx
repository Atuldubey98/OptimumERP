import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  IconButton,
  Text,
  Flex,
  Circle,
  Textarea,
  Portal,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { FiSend, FiMessageSquare, FiX } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import remarkGfm from 'remark-gfm';

const ChatWidget = ({ orgId = localStorage.getItem("organization") }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false); // New state for thinking

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(`chat_history_${orgId}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const socket = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(`chat_history_${orgId}`, JSON.stringify(messages.slice(-20)));
  }, [messages, orgId]);

  useEffect(() => {
    let reconnectionTimer;
    const connect = () => {
      const wsUrl = `ws://localhost:3000?orgId=${orgId}`;
      if (!orgId) return;
      socket.current = new WebSocket(wsUrl);

      socket.current.onopen = () => setIsConnected(true);
      socket.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'ai_response') {
            setMessages((prev) => [...prev, { role: 'ai', content: data.message }]);
            setIsTyping(false); // AI responded, stop thinking
          }
        } catch (err) {
          console.error(err);
          setIsTyping(false); // Reset on error
        }
      };
      socket.current.onclose = () => {
        setIsConnected(false);
        reconnectionTimer = setTimeout(connect, 3000);
      };
    };
    connect();
    return () => {
      if (socket.current) socket.current.close();
      clearTimeout(reconnectionTimer);
    };
  }, [orgId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isOpen, isTyping]); // Added isTyping to dependency

  const handleSend = () => {
    if (!input.trim() || !isConnected) return;
    
    setIsTyping(true); // Start thinking state
    socket.current.send(JSON.stringify({ message: input.trim() }));
    setMessages((prev) => [...prev, { role: 'user', content: input.trim() }]);
    setInput('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e) => {
    const userMsgs = messages.filter(m => m.role === 'user');
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'ArrowUp' && (input === '' || historyIndex !== -1)) {
      if (userMsgs.length > 0) {
        const newIdx = historyIndex === -1 ? userMsgs.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIdx);
        setInput(userMsgs[newIdx].content);
      }
    }
  };

  const MarkdownComponents = {
    p: ({ children }) => (
      <Text mb={3} fontSize="13px" lineHeight="1.6">
        {children}
      </Text>
    ),
    ul: ({ children }) => (
      <Box as="ul" pl={5} mb={3} style={{ listStyleType: 'disc' }}>
        {children}
      </Box>
    ),
    ol: ({ children }) => (
      <Box as="ol" pl={5} mb={3} style={{ listStyleType: 'decimal' }}>
        {children}
      </Box>
    ),
    li: ({ children }) => (
      <Box as="li" fontSize="13px" mb={1} pl={1}>
        {children}
      </Box>
    ),
    strong: ({ children }) => (
      <Text as="span" fontWeight="700" color="blue.300" _light={{ color: "blue.600" }}>
        {children}
      </Text>
    ),
    h3: ({ children }) => (
      <Text fontSize="14px" fontWeight="bold" mt={4} mb={2} color="whiteAlpha.900" _light={{ color: "gray.800" }}>
        {children}
      </Text>
    ),
    table: ({ children }) => (
      <TableContainer 
        my={3} 
        borderRadius="md" 
        borderWidth="1px" 
        borderColor="whiteAlpha.200"
        _light={{ borderColor: "gray.200" }}
      >
        <Table variant="simple" size="sm">
          {children}
        </Table>
      </TableContainer>
    ),
    thead: ({ children }) => <Thead bg="whiteAlpha.100" _light={{ bg: "gray.50" }}>{children}</Thead>,
    th: ({ children }) => (
      <Th 
        color="whiteAlpha.700" 
        _light={{ color: "gray.600" }} 
        textTransform="none" 
        fontSize="11px"
        py={2}
      >
        {children}
      </Th>
    ),
    td: ({ children }) => (
      <Td fontSize="12px" py={2} color="whiteAlpha.800" _light={{ color: "gray.700" }}>
        {children}
      </Td>
    ),
    hr: () => <Divider my={4} borderColor="whiteAlpha.300" />,
    code: ({ children }) => (
        <Box 
            as="code" 
            px={1.5} 
            py={0.5} 
            borderRadius="sm" 
            bg="whiteAlpha.200" 
            fontSize="12px"
            _light={{ bg: "gray.100", color: "red.600" }}
        >
            {children}
        </Box>
    )
  };

  return (
    <Portal>
      <Box position="fixed" bottom={{ base: "0", md: "20px" }} right={{ base: "0", md: "20px" }} zIndex="9999">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              <Flex
                flexDirection="column"
                width={{ base: "100vw", md: "400px" }}
                height={{ base: "100dvh", md: "600px" }}
                bg="gray.800"
                borderRadius={{ base: "0", md: "2xl" }}
                borderWidth={{ base: "0", md: "1px" }}
                borderColor="whiteAlpha.200"
                overflow="hidden"
                mb={{ base: 0, md: 4 }}
                _light={{ bg: "white", borderColor: "gray.200" }}
              >
                <Flex bg="blue.600" color="white" px={4} py={3} align="center" justify="space-between">
                  <HStack gap={3}>
                    <RiRobot2Line size={22} />
                    <Box>
                      <Text fontWeight="bold" fontSize="13px" m={0}>OptimumERP Assistant</Text>
                      <HStack gap={1}>
                        <Circle size="1.5" bg={isConnected ? "green.400" : "red.400"} />
                        <Text fontSize="10px" m={0} opacity={0.8}>
                          {isConnected ? "Connected" : "Offline"}
                        </Text>
                      </HStack>
                    </Box>
                  </HStack>
                  <IconButton
                    aria-label="Close"
                    variant="ghost"
                    size="sm"
                    color="white"
                    icon={<FiX size={18} />}
                    onClick={() => setIsOpen(false)}
                  />
                </Flex>

                <Box
                  flex="1"
                  overflowY="auto"
                  p={4}
                  bg="#131720"
                  ref={scrollRef}
                  _light={{ bg: "gray.50" }}
                >
                  <VStack align="stretch" spacing={4}>
                    {messages.map((msg, i) => (
                      <Flex key={i} justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}>
                        <Box
                          maxW="92%"
                          p={3}
                          borderRadius="xl"
                          bg={msg.role === 'user' ? 'blue.500' : 'gray.700'}
                          color="white"
                          boxShadow="sm"
                          _light={{
                            bg: msg.role === 'user' ? 'blue.600' : 'white',
                            color: msg.role === 'user' ? 'white' : 'gray.800',
                            borderWidth: msg.role === 'ai' ? "1px" : "0px",
                            borderColor: "gray.200"
                          }}
                        >
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]} 
                            components={MarkdownComponents}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </Box>
                      </Flex>
                    ))}

                    {/* THINKING STATE UI */}
                    {isTyping && (
                      <Flex justify="flex-start">
                        <Box
                          p={3}
                          borderRadius="xl"
                          bg="gray.700"
                          _light={{ bg: "white", borderWidth: "1px", borderColor: "gray.200" }}
                        >
                          <HStack spacing={2}>
                            <Spinner size="xs" color="blue.400" />
                            <Text fontSize="12px" color="gray.400" _light={{ color: "gray.500" }}>
                              Assistant is thinking...
                            </Text>
                          </HStack>
                        </Box>
                      </Flex>
                    )}
                  </VStack>
                </Box>

                <Box p={3} bg="gray.800" borderTopWidth="1px" borderColor="whiteAlpha.100" _light={{ bg: "white", borderColor: "gray.100" }}>
                  <HStack align="flex-end" spacing={2}>
                    <Textarea
                      placeholder="Ask me anything..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      fontSize="13px"
                      minH="40px"
                      maxH="120px"
                      bg="gray.700"
                      color="white"
                      borderRadius="lg"
                      resize="none"
                      rows={1}
                      py={2}
                      _light={{ bg: "gray.100", color: "gray.800", _focus: { bg: "white" } }}
                      _hover={{ bg: "gray.600" }}
                      _focus={{ borderColor: "blue.400", bg: "gray.900" }}
                    />
                    <IconButton
                      aria-label="Send"
                      colorScheme="blue"
                      icon={<FiSend size={16} />}
                      onClick={handleSend}
                      isDisabled={!isConnected || !input.trim() || isTyping} // Disabled while thinking
                      borderRadius="lg"
                    />
                  </HStack>
                </Box>
              </Flex>
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <Flex justify="flex-end">
            <IconButton
              aria-label="Open Chat"
              onClick={() => setIsOpen(true)}
              size="lg"
              colorScheme="blue"
              borderRadius="full"
              width="60px"
              height="60px"
              boxShadow="xl"
              icon={<FiMessageSquare size={26} />}
            />
          </Flex>
        )}
      </Box>
    </Portal>
  );
};

export default ChatWidget;