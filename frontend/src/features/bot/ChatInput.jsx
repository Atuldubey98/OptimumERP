import React, { memo } from "react";
import { Box, VStack, Tag, TagLabel, TagCloseButton, Flex, IconButton, HStack, Circle, keyframes } from "@chakra-ui/react";
import TextareaAutosize from "react-textarea-autosize";
import { FiMic, FiPaperclip, FiSend, FiImage as FiImageIcon, FiFileText } from "react-icons/fi";

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
  isTyping
}) => {
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
  );
});

export default ChatInput;
