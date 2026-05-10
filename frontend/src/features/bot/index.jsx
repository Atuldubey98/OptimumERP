import {
  Box,
  Flex,
  IconButton,
  Portal,
  VStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RiRobot2Line } from "react-icons/ri";
import { useNavigate, useParams } from "react-router-dom";

// Hooks
import { useChatSocket } from "../../hooks/useChatSocket";
import { useFileUpload } from "../../hooks/useFileUpload";
import { useSpeechToText } from "../../hooks/useSpeechToText";
import useProperty from "../../hooks/useProperty";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";

// Components
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageList from "./components/MessageList";
import TypingIndicator from "./components/TypingIndicator";
import ResetDialog from "./components/ResetDialog";
import SetupRequired from "./components/SetupRequired";
import EmptyState from "./components/EmptyState";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isClearing, setIsClearing] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const cancelRef = useRef();
  
  const { isOpen: isResetOpen, onOpen: onResetOpen, onClose: onResetClose } = useDisclosure();
  const { orgId } = useParams();
  const navigate = useNavigate();

  const { messages, isConnected, isTyping, statusMsg, sendMessage, clearHistory } = useChatSocket(orgId);
  const { setting } = useCurrentOrgCurrency();
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem("selected_ai_model") || "");

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
      } else {
        localStorage.setItem("selected_ai_model", selectedModel);
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
  }, [input, attachment, isConnected, sendMessage, clearAttachment, selectedModel]);

  const handleConfirmReset = async () => {
    setIsClearing(true);
    try {
      await clearHistory(selectedModel);
      onResetClose();
    } finally {
      setIsClearing(false);
    }
  };

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
                <ChatHeader 
                  isConnected={isConnected} 
                  onToggle={toggleOpen} 
                  onReset={onResetOpen} 
                  showReset={messages.length > 0}
                />

                <Box flex="1" overflowY="auto" p={4} bg={messageAreaBg} ref={scrollRef}>
                  <VStack align="stretch" spacing={4} minHeight="100%">
                    {!activeProvider ? (
                      <SetupRequired 
                        onNavigate={() => {
                          setIsOpen(false);
                          navigate(`/${orgId}/application`);
                        }} 
                      />
                    ) : messages.length === 0 ? (
                      <EmptyState />
                    ) : (
                      <MessageList messages={messages} formatTime={formatTime} />
                    )}
                    
                    {isTyping && <TypingIndicator statusMsg={statusMsg} />}
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
              icon={<RiRobot2Line size={24} />} 
            />
          </Flex>
        )}

        <ResetDialog 
          isOpen={isResetOpen}
          onClose={onResetClose}
          onConfirm={handleConfirmReset}
          cancelRef={cancelRef}
          isClearing={isClearing}
          widgetBg={widgetBg}
          widgetBorder={widgetBorder}
        />
      </Box>
    </Portal>
  );
};

export default ChatWidget;
