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
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiMessageSquare } from "react-icons/fi";
import { useParams } from "react-router-dom";
import useChatSocket from "../../hooks/useChatSocket";
import useFileUpload from "../../hooks/useFileUpload";
import useSpeechToText from "../../hooks/useSpeechToText";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageItem from "./MessageItem";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const { orgId } = useParams();

  const { messages, isConnected, isTyping, statusMsg, sendMessage } = useChatSocket(orgId);
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

  const botBtnBg = useColorModeValue("indigo.500", "indigo.600");
  const botBtnHoverBg = useColorModeValue("indigo.600", "indigo.700");
  const widgetBg = useColorModeValue("white", "gray.800");
  const widgetBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const messageAreaBg = useColorModeValue("gray.50", "#131720");

  if (!isConnected) return null;

  return (
    <Portal>
      <Box position="fixed" bottom="10px" right="10px" zIndex={1000}>
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <Flex 
                flexDirection="column" 
                width={{ base: "calc(100vw - 40px)", md: "400px" }} 
                height={{ base: "60vh", md: "600px" }} 
                bg={widgetBg} 
                borderRadius="2xl" 
                borderWidth="1px" 
                borderColor={widgetBorder} 
                overflow="hidden" 
                mb={4} 
                boxShadow="2xl"
              >
                <ChatHeader isConnected={isConnected} onToggle={toggleOpen} />

                {/* Messages Area */}
                <Box flex="1" overflowY="auto" p={4} bg={messageAreaBg} ref={scrollRef}>
                  <VStack align="stretch" spacing={4}>
                    {memoizedMessages}
                    {isTyping && (
                      <Flex justify="flex-start">
                        <Box p={3} borderRadius="xl" bg={useColorModeValue("white", "gray.700")} borderWidth={useColorModeValue("1px", "0px")} borderColor="gray.200">
                          <HStack spacing={2}>
                            <Spinner size="xs" color="indigo.400" />
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
                  isConnected={isConnected}
                  isTyping={isTyping}
                />
              </Flex>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isOpen && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <IconButton 
              aria-label="Open Chat" 
              onClick={toggleOpen} 
              size="sm" 
              bg={botBtnBg}
              color="white"
              _hover={{ bg: botBtnHoverBg }}
              borderRadius="full" 
              width="60px" 
              height="60px" 
              boxShadow="2xl" 
              icon={<FiMessageSquare size={20} />} 
            />
          </motion.div>
        )}
      </Box>
    </Portal>
  );
};

export default ChatWidget;