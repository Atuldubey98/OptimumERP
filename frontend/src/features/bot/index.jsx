import {
  Box,
  Flex,
  HStack, 
  IconButton,
  Portal,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiMessageSquare, FiCpu } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useChatSocket } from "../../hooks/useChatSocket";
import { useFileUpload } from "../../hooks/useFileUpload";
import { useSpeechToText } from "../../hooks/useSpeechToText";
import useProperty from "../../hooks/useProperty";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageItem from "./MessageItem";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import { FiSettings, FiAlertTriangle } from "react-icons/fi";
import { Button } from "@chakra-ui/react";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const { orgId } = useParams();
  const navigate = useNavigate();

  const { messages, isConnected, isTyping, statusMsg, sendMessage } = useChatSocket(orgId);
  const { setting } = useCurrentOrgCurrency();
  const [selectedModel, setSelectedModel] = useState("");

  const { value: AI_MODELS } = useProperty("AI_MODELS");

  const activeProvider = useMemo(() => {
    return setting?.aiProviders?.find((p) => p.isActive);
  }, [setting]);

  const availableModels = useMemo(() => {
    if (!AI_MODELS || !activeProvider) return [];
    return AI_MODELS[activeProvider.provider] || [];
  }, [activeProvider, AI_MODELS]);

  useEffect(() => {
    if (availableModels.length > 0) {
      const isValid = availableModels.some(m => m.id === selectedModel);
      if (!selectedModel || !isValid) {
        setSelectedModel(availableModels[0].id);
      }
    }
  }, [availableModels, selectedModel]);

  const { attachment, handleFileChange, clearAttachment } = useFileUpload();
  const { isListening, isSupported, startListening, stopListening } = useSpeechToText((transcript) => {
    setInput(transcript);
  });

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping, statusMsg, scrollToBottom]);

  const handleSend = useCallback(() => {
    if ((!input.trim() && !attachment) || !isConnected) return;
    const now = new Date().toISOString();
    const payload = {
      message: input.trim(),
      model: selectedModel,
      attachment: attachment ? {
        name: attachment.name,
        type: attachment.type,
        content: attachment.content,
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
  }, [input, attachment, isConnected, sendMessage, clearAttachment]);

  const handleKeyDown = useCallback((e) => {
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
  }, [messages, input, historyIndex, handleSend]);

  const formatTime = useCallback((isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);

  const memoizedMessages = useMemo(() => {
    return messages.map((msg, i) => (
      <MessageItem key={i} msg={msg} formatTime={formatTime} />
    ));
  }, [messages, formatTime]);

  const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);

  const widgetBg = useColorModeValue("white", "gray.800");
  const widgetBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const messageAreaBg = useColorModeValue("gray.50", "#131720");

  if (!isConnected) return null;

  return (
    <Portal>
      <Box 
        position="fixed" 
        bottom={{ base: isOpen ? "0" : "8px", md: "20px" }} 
        right={{ base: isOpen ? "0" : "8px", md: "20px" }} 
        zIndex={1000}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}>
              <Flex 
                flexDirection="column" 
                width={{ base: "100vw", md: "400px" }} 
                height={{ base: "100dvh", md: "600px" }} 
                bg={widgetBg} 
                borderRadius={{ base: "0", md: "2xl" }} 
                borderWidth={{ base: "0", md: "1px" }} 
                borderColor={widgetBorder} 
                overflow="hidden" 
                mb={{ base: 0, md: 4 }} 
                boxShadow="2xl"
              >
                <ChatHeader isConnected={isConnected} onToggle={toggleOpen} />

                {/* Messages Area */}
                <Box flex="1" overflowY="auto" p={4} bg={messageAreaBg} ref={scrollRef}>
                  <VStack align="stretch" spacing={4} minHeight="100%">
                    {!activeProvider ? (
                      <Flex 
                        direction="column" 
                        align="center" 
                        justify="center" 
                        flex="1" 
                        py={20}
                        px={10}
                        textAlign="center"
                      >
                        <Icon as={FiAlertTriangle} fontSize="4xl" color="orange.400" mb={4} />
                        <Text fontWeight="600" fontSize="md" mb={2}>AI Setup Required</Text>
                        <Text fontSize="xs" color="gray.500" mb={6}>
                          No AI providers are configured or active for this organization. Please set up a provider to start chatting.
                        </Text>
                        <Button 
                          leftIcon={<FiSettings />} 
                          colorScheme="blue" 
                          size="sm" 
                          onClick={() => {
                            setIsOpen(false);
                            navigate(`/${orgId}/application`);
                          }}
                        >
                          Go to Settings
                        </Button>
                      </Flex>
                    ) : messages.length === 0 ? (
                      <Flex 
                        direction="column" 
                        align="center" 
                        justify="center" 
                        flex="1" 
                        py={20}
                        opacity={0.6}
                      >
                        <Icon as={FiCpu} fontSize="4xl" color="blue.500" mb={4} />
                        <Text fontWeight="600" fontSize="md">Say Hi 👋 !</Text>
                        <Text fontSize="sm">Start a conversation with OptiBot!</Text>
                      </Flex>
                    ) : (
                      memoizedMessages
                    )}
                    
                    {isTyping && (
                      <Flex justify="flex-start">
                        <Box p={3} borderRadius="xl" bg={useColorModeValue("white", "gray.700")} borderWidth={useColorModeValue("1px", "0px")} borderColor="gray.200">
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

                <ChatInput 
                  input={input}
                  setInput={setInput}
                  handleKeyDown={handleKeyDown}
                  handleSend={handleSend}
                  attachment={attachment}
                  clearAttachment={clearAttachment}
                  isListening={isListening}
                  isSupported={isSupported}
                  startListening={startListening}
                  stopListening={stopListening}
                  fileInputRef={fileInputRef}
                  handleFileChange={handleFileChange}
                  isConnected={isConnected && !!activeProvider}
                  isTyping={isTyping}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  availableModels={availableModels}
                />
              </Flex>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isOpen && (
          <Flex justify="flex-end">
            <IconButton 
              aria-label="Open Chat" 
              onClick={toggleOpen} 
              size="md" 
              colorScheme="blue"
              borderRadius="full" 
              width="50px" 
              height="50px" 
              boxShadow="2xl" 
              icon={<FiMessageSquare size={22} />} 
            />
          </Flex>
        )}
      </Box>
    </Portal>
  );
};

export default ChatWidget;