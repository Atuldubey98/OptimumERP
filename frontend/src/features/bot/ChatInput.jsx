import { memo } from "react";
import { Box, VStack, Tag, TagLabel, TagCloseButton, Flex, IconButton, HStack, Circle, keyframes, Icon, Tooltip, useDisclosure, Text } from "@chakra-ui/react";
import TextareaAutosize from "react-textarea-autosize";
import { FiMic, FiPaperclip, FiSend, FiImage as FiImageIcon, FiFileText, FiCpu, FiSquare, FiSettings } from "react-icons/fi";
import ModelSelectModal from "./components/ModelSelectModal";
import { motion } from "framer-motion";

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.4; }
  100% { transform: scale(1); opacity: 1; }
`;

const ChatInput = memo(({
  input,
  setInput,
  handleKeyDown,
  handleSend,
  attachment,
  clearAttachment,
  isListening,
  isSupported,
  startListening,
  stopListening,
  fileInputRef,
  handleFileChange,
  isConnected,
  isTyping,
  selectedModel,
  setSelectedModel,
  availableModels,
  activeProviders,
  selectedProviderId,
  setSelectedProviderId,
  abortMessage
}) => {
  const currentModel = availableModels.find(m => m.id === selectedModel);
  const hasNoProvider = !activeProviders || activeProviders.length === 0;
  const { isOpen: isModelModalOpen, onOpen: onModelModalOpen, onClose: onModelModalClose } = useDisclosure();
  const charsLeft = 1000 - (input || "").length;

  return (
    <Box p={3} bg="gray.800" borderTopWidth="1px" borderColor="whiteAlpha.100" _light={{ bg: "white", borderColor: "gray.100" }}>
      <VStack align="stretch" spacing={2}>
        {attachment && (
          <Tag size="md" variant="solid" colorScheme="blue" borderRadius="full" alignSelf="flex-start">
            {attachment.type.startsWith("image/") ? <FiImageIcon style={{ marginRight: "6px" }} /> : <FiFileText style={{ marginRight: "6px" }} />}
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
          <Box
            as={TextareaAutosize}
            minRows={1}
            maxRows={5}
            placeholder={isListening ? "Listening..." : "Ask me anything..."}
            value={input}
            onChange={(e) => {
              let val = e.target.value;
              // Trim leading whitespace
              val = val.replace(/^\s+/, "");
              // Replace consecutive spaces with a single space
              val = val.replace(/ +/g, " ");
              // Limit characters to 1000
              if (val.length <= 1000) {
                setInput(val);
              }
            }}
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
            maxLength={1000}
          />

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
              {currentModel?.vision && (
                <>
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
                </>
              )}
            </HStack>

            <Text
              fontSize="xs"
              fontWeight="medium"
              color={charsLeft <= 100 ? "red.400" : charsLeft <= 200 ? "orange.400" : "whiteAlpha.500"}
              _light={{
                color: charsLeft <= 100 ? "red.500" : charsLeft <= 200 ? "orange.500" : "gray.400"
              }}
            >
              {(input || "").length}/1000
            </Text>

            <HStack spacing={2}>
              <>
                <Tooltip label={hasNoProvider ? "No AI provider configured" : "Select Model & Provider"} fontSize="xs" placement="top" hasArrow>
                  <Box position="relative" display="inline-flex">
                    <IconButton
                      aria-label="Select Model"
                      variant="ghost"
                      size="sm"
                      icon={<FiSettings size={16} />}
                      onClick={onModelModalOpen}
                      color={hasNoProvider ? "orange.400" : "whiteAlpha.600"}
                      _light={{ color: hasNoProvider ? "orange.500" : "gray.400" }}
                      _hover={{ bg: "whiteAlpha.200", _light: { bg: "gray.100" } }}
                    />
                    {hasNoProvider && (
                      <Box
                        position="absolute"
                        top="-2px"
                        right="-2px"
                        bg="orange.400"
                        borderRadius="full"
                        w="14px"
                        h="14px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="9px"
                        fontWeight="bold"
                        color="white"
                        lineHeight="1"
                      >!</Box>
                    )}
                  </Box>
                </Tooltip>
                <ModelSelectModal
                  isOpen={isModelModalOpen}
                  onClose={onModelModalClose}
                  availableModels={availableModels}
                  selectedModel={selectedModel}
                  onSelect={setSelectedModel}
                  activeProviders={activeProviders}
                  selectedProviderId={selectedProviderId}
                  onSelectProvider={setSelectedProviderId}
                />
              </>
              {currentModel?.thinking && (
                <Tooltip label="Thinking Model" fontSize="xs" placement="top" hasArrow>
                  <Flex align="center" px={1} cursor="help">
                    <Box
                      as={motion.div}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Icon as={FiCpu} size="xs" color="purple.400" />
                    </Box>
                  </Flex>
                </Tooltip>
              )}
              {isTyping ? (
                <IconButton
                  aria-label="Stop generation"
                  colorScheme="red"
                  size="sm"
                  icon={<FiSquare size={14} fill="currentColor" />}
                  onClick={abortMessage}
                  borderRadius="lg"
                  boxShadow="md"
                  _hover={{ transform: "scale(1.05)" }}
                  _active={{ transform: "scale(0.95)" }}
                />
              ) : (
                <IconButton
                  aria-label="Send"
                  colorScheme="blue"
                  size="sm"
                  icon={<FiSend size={14} />}
                  onClick={handleSend}
                  isDisabled={!isConnected || (!(input || "").trim() && !attachment)}
                  borderRadius="lg"
                  boxShadow="md"
                  _hover={{ transform: "scale(1.05)" }}
                  _active={{ transform: "scale(0.95)" }}
                />
              )}
            </HStack>
          </Flex>
        </Flex>
      </VStack>
    </Box>
  );
});

export default ChatInput;
