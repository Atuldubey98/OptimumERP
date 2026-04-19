import React, { useState, useEffect, useRef } from "react";
import {
  Box, VStack, HStack, IconButton, Text, Flex, Circle, Portal,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Divider, Spinner,
  Image, Tag, TagLabel, TagCloseButton, keyframes,
} from "@chakra-ui/react";
import {
  FiSend, FiMessageSquare, FiX, FiPaperclip, FiFileText, FiImage, FiMic,
} from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import remarkGfm from "remark-gfm";
import TextareaAutosize from "react-textarea-autosize";
import { useFileUpload } from "../../hooks/useFileUpload";
import { useChatSocket } from "../../hooks/useChatSocket";
import { useSpeechToText } from "../../hooks/useSpeechToText";

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.4; }
  100% { transform: scale(1); opacity: 1; }
`;

const ChatWidget = ({ orgId = localStorage.getItem("organization") }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const { messages, isConnected, isTyping, statusMsg, sendMessage } = useChatSocket(orgId);
  const { attachment, handleFileChange, clearAttachment } = useFileUpload();
  const { isListening, isSupported, startListening, stopListening } = useSpeechToText((transcript) => {
    setInput(transcript);
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isOpen, isTyping, statusMsg]);

  const handleSend = () => {
    if ((!input.trim() && !attachment) || !isConnected) return;
    const now = new Date().toISOString();
    const payload = {
      message: input.trim(),
      attachment: attachment ? {
        name: attachment.name,
        type: attachment.type,
        content: attachment.base64,
      } : null,
    };
    const userMessage = {
      role: "user",
      content: input.trim(),
      timestamp: now,
      attachment: attachment ? {
        name: attachment.name,
        type: attachment.type,
        data: attachment.preview,
      } : null,
    };
    sendMessage(payload, userMessage);
    setInput("");
    clearAttachment();
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e) => {
    const userMsgs = messages.filter((m) => m.role === "user");
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "ArrowUp" && (input === "" || historyIndex !== -1)) {
      if (userMsgs.length > 0) {
        const newIdx = historyIndex === -1 ? userMsgs.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIdx);
        setInput(userMsgs[newIdx].content);
      }
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const MarkdownComponents = {
    p: ({ children }) => <Text mb={3} fontSize="13px" lineHeight="1.6">{children}</Text>,
    ul: ({ children }) => <Box as="ul" pl={5} mb={3} style={{ listStyleType: "disc" }}>{children}</Box>,
    ol: ({ children }) => <Box as="ol" pl={5} mb={3} style={{ listStyleType: "decimal" }}>{children}</Box>,
    li: ({ children }) => <Box as="li" fontSize="13px" mb={1} pl={1}>{children}</Box>,
    strong: ({ children }) => <Text as="span" fontWeight="700" color="blue.300" _light={{ color: "blue.600" }}>{children}</Text>,
    h3: ({ children }) => <Text fontSize="14px" fontWeight="bold" mt={4} mb={2} color="whiteAlpha.900" _light={{ color: "gray.800" }}>{children}</Text>,
    a: ({ children, href }) => <Text as="a" href={href} target="_blank" rel="noopener noreferrer" color="blue.400" fontWeight="600" textDecoration="underline" textUnderlineOffset="2px" cursor="pointer" transition="all 0.2s" _hover={{ color: "blue.300", opacity: 0.8 }} _light={{ color: "blue.600", _hover: { color: "blue.700" } }}>{children}</Text>,
    table: ({ children }) => (
      <TableContainer my={3} maxW="100%" borderRadius="md" borderWidth="1px" borderColor="whiteAlpha.200" _light={{ borderColor: "gray.200" }} overflowX="auto">
        <Table variant="simple" size="sm" layout="fixed" width="full">{children}</Table>
      </TableContainer>
    ),
    thead: ({ children }) => <Thead bg="whiteAlpha.100" _light={{ bg: "gray.50" }}>{children}</Thead>,
    th: ({ children }) => <Th color="whiteAlpha.700" _light={{ color: "gray.600" }} textTransform="none" fontSize="10px" py={2} px={2} wordBreak="break-word" whiteSpace="normal">{children}</Th>,
    td: ({ children }) => <Td fontSize="11px" py={2} px={2} color="whiteAlpha.800" _light={{ color: "gray.700" }} wordBreak="break-word" whiteSpace="normal">{children}</Td>,
    hr: () => <Divider my={4} borderColor="whiteAlpha.300" />,
    code: ({ children }) => <Box as="code" px={1.5} py={0.5} borderRadius="sm" bg="whiteAlpha.200" fontSize="12px" _light={{ bg: "gray.100", color: "red.600" }}>{children}</Box>,
  };

  return (
    <Portal>
      <Box position="fixed" bottom={{ base: "0", md: "20px" }} right={{ base: "0", md: "20px" }} zIndex="9999">
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}>
              <Flex flexDirection="column" width={{ base: "100vw", md: "400px" }} height={{ base: "100dvh", md: "600px" }} bg="gray.800" borderRadius={{ base: "0", md: "2xl" }} borderWidth={{ base: "0", md: "1px" }} borderColor="whiteAlpha.200" overflow="hidden" mb={{ base: 0, md: 4 }} _light={{ bg: "white", borderColor: "gray.200" }}>
                
                {/* Header */}
                <Flex bg="blue.600" color="white" px={4} py={3} align="center" justify="space-between">
                  <HStack gap={3}>
                    <RiRobot2Line size={22} />
                    <Box>
                      <Text fontWeight="bold" fontSize="13px" m={0}>OptimumERP Assistant</Text>
                      <HStack gap={1}>
                        <Circle size="1.5" bg={isConnected ? "green.400" : "red.400"} />
                        <Text fontSize="10px" m={0} opacity={0.8}>{isConnected ? "Connected" : "Offline"}</Text>
                      </HStack>
                    </Box>
                  </HStack>
                  <IconButton aria-label="Close" variant="ghost" size="sm" color="white" icon={<FiX size={18} />} onClick={() => setIsOpen(false)} />
                </Flex>

                {/* Messages Area */}
                <Box flex="1" overflowY="auto" p={4} bg="#131720" ref={scrollRef} _light={{ bg: "gray.50" }}>
                  <VStack align="stretch" spacing={4}>
                    {messages.map((msg, i) => (
                      <Flex key={i} justify={msg.role === "user" ? "flex-end" : "flex-start"} direction="column" align={msg.role === "user" ? "flex-end" : "flex-start"}>
                        {msg.attachment && (
                          <Box mb={2} maxW="70%">
                            {msg.attachment.type.startsWith("image/") ? (
                              <Image src={msg.attachment.data} borderRadius="md" alt="upload" fallbackSrc="https://via.placeholder.com/150" />
                            ) : (
                              <HStack p={2} bg="whiteAlpha.200" borderRadius="md" _light={{ bg: "gray.100" }}>
                                <FiFileText color="#EDF2F7" />
                                <Text fontSize="xs" noOfLines={1} color="white" _light={{ color: "gray.800" }}>{msg.attachment.name}</Text>
                              </HStack>
                            )}
                          </Box>
                        )}
                        <VStack align={msg.role === "user" ? "flex-end" : "flex-start"} spacing={1} maxW="92%">
                          <Box p={3} borderRadius="xl" bg={msg.role === "user" ? "blue.500" : "gray.700"} color="white" boxShadow="sm" _light={{ bg: msg.role === "user" ? "blue.600" : "white", color: msg.role === "user" ? "white" : "gray.800", borderWidth: msg.role === "ai" ? "1px" : "0px", borderColor: "gray.200" }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>{msg.content}</ReactMarkdown>
                          </Box>
                          <Text fontSize="10px" color="whiteAlpha.600" _light={{ color: "gray.500" }} px={1}>{formatTime(msg.timestamp)}</Text>
                        </VStack>
                      </Flex>
                    ))}
                    {isTyping && (
                      <Flex justify="flex-start">
                        <Box p={3} borderRadius="xl" bg="gray.700" _light={{ bg: "white", borderWidth: "1px", borderColor: "gray.200" }}>
                          <HStack spacing={2}>
                            <Spinner size="xs" color="blue.400" />
                            <AnimatePresence mode="wait">
                              <motion.div key={statusMsg} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
                                <Text fontSize="12px" color="gray.400" _light={{ color: "gray.500" }}>{statusMsg}</Text>
                              </motion.div>
                            </AnimatePresence>
                          </HStack>
                        </Box>
                      </Flex>
                    )}
                  </VStack>
                </Box>

                {/* Input Area */}
                <Box p={3} bg="gray.800" borderTopWidth="1px" borderColor="whiteAlpha.100" _light={{ bg: "white", borderColor: "gray.100" }}>
                  <VStack align="stretch" spacing={2}>
                    {attachment && (
                      <Tag size="md" variant="solid" colorScheme="blue" borderRadius="full" alignSelf="flex-start">
                        {attachment.type.startsWith("image/") ? <FiImage style={{ marginRight: "6px" }} /> : <FiFileText style={{ marginRight: "6px" }} />}
                        <TagLabel fontSize="11px" maxW="200px" isTruncated>{attachment.name}</TagLabel>
                        <TagCloseButton onClick={clearAttachment} />
                      </Tag>
                    )}

                    <Flex 
                      direction="column"
                      bg="gray.700" 
                      borderRadius="xl" 
                      borderWidth="1px"
                      borderColor={isListening ? "red.400" : "whiteAlpha.200"}
                      _light={{ 
                        bg: "gray.50",
                        borderColor: isListening ? "red.400" : "gray.200" 
                      }}
                      transition="all 0.2s"
                      overflow="hidden"
                    >
                      {/* Autosize Textarea */}
                      <Box 
                        as={TextareaAutosize}
                        minRows={1}
                        maxRows={5}
                        placeholder={isListening ? "Listening..." : "Ask me anything..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        fontSize="13px"
                        width="100%"
                        p={3}
                        bg="transparent"
                        border="none"
                        color="white"
                        _light={{ color: "gray.800" }}
                        _focus={{ outline: "none" }}
                        style={{ resize: "none" }}
                      />
                      
                      {/* Action Bar at Bottom */}
                      <Flex px={2} pb={2} justify="space-between" align="center">
                        <HStack spacing={1}>
                          {isSupported && (
                            <Box position="relative">
                              {isListening && (
                                <Circle position="absolute" size="28px" bg="red.500" opacity={0.3} top="2px" left="2px" animation={`${pulse} 1.5s infinite ease-in-out`} />
                              )}
                              <IconButton
                                aria-label="Record voice"
                                variant="ghost"
                                size="sm"
                                icon={<FiMic size={16} />}
                                onClick={isListening ? stopListening : startListening}
                                color={isListening ? "red.400" : "whiteAlpha.600"}
                                _light={{ color: isListening ? "red.500" : "gray.400" }}
                                _hover={{ bg: "whiteAlpha.200" }}
                              />
                            </Box>
                          )}
                          <input type="file" hidden ref={fileInputRef} accept="application/pdf,image/*" onChange={handleFileChange} />
                          <IconButton 
                            aria-label="Attach file" 
                            variant="ghost" 
                            size="sm"
                            icon={<FiPaperclip size={16} />} 
                            onClick={() => fileInputRef.current.click()} 
                            color="whiteAlpha.600" 
                            _light={{ color: "gray.400" }}
                            _hover={{ bg: "whiteAlpha.200" }}
                          />
                        </HStack>

                        <IconButton 
                          aria-label="Send" 
                          colorScheme="blue" 
                          size="sm"
                          icon={<FiSend size={14} />} 
                          onClick={handleSend} 
                          isDisabled={!isConnected || (!input.trim() && !attachment) || isTyping} 
                          borderRadius="lg" 
                          boxShadow="md"
                          _hover={{ transform: "scale(1.05)" }}
                          _active={{ transform: "scale(0.95)" }}
                        />
                      </Flex>
                    </Flex>
                  </VStack>
                </Box>
              </Flex>
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && (
          <Flex justify="flex-end">
            <IconButton aria-label="Open Chat" onClick={() => setIsOpen(true)} size="lg" colorScheme="blue" borderRadius="full" width="60px" height="60px" boxShadow="xl" icon={<FiMessageSquare size={26} />} />
          </Flex>
        )}
      </Box>
    </Portal>
  );
};

export default ChatWidget;