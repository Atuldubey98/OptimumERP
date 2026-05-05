import React, { memo } from "react";
import { Flex, Box, VStack, Text, Image, HStack, Circle } from "@chakra-ui/react";
import { FiFileText } from "react-icons/fi";
import MarkdownRenderer from "./MarkdownRenderer";
import { baseURL } from "../../instance";

const MessageItem = memo(({ msg, formatTime }) => {
  return (
    <Flex justify={msg.role === "user" ? "flex-end" : "flex-start"} direction="column" align={msg.role === "user" ? "flex-end" : "flex-start"}>
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
        <Box 
          p={3} 
          borderRadius="xl" 
          bg={msg.role === "user" ? "blue.500" : "gray.700"} 
          color="white" 
          boxShadow="sm" 
          _light={{ 
            bg: msg.role === "user" ? "blue.600" : "white", 
            color: msg.role === "user" ? "white" : "gray.800", 
            borderWidth: msg.role === "ai" ? "1px" : "0px", 
            borderColor: "gray.200" 
          }}
          maxW="100%"
          overflow="hidden"
        >
          <MarkdownRenderer content={msg.content} />
          {msg.downloads && msg.downloads.length > 0 && (
            <Flex wrap="wrap" gap={2} mt={3} pt={2} borderTopWidth="1px" borderColor="whiteAlpha.200" _light={{ borderColor: "gray.100" }}>
              {msg.downloads.map((download, idx) => (
                <HStack 
                  key={idx} 
                  as="a" 
                  href={download.url.startsWith("http") ? download.url : `${baseURL}${download.url}`} 
                  download 
                  target="_blank"
                  rel="noopener noreferrer"
                  px={3}
                  py={1.5}
                  bg="whiteAlpha.200"
                  borderRadius="full"
                  _hover={{ bg: "whiteAlpha.300", transform: "translateY(-1px)" }}
                  _light={{ 
                    bg: "gray.100", 
                    _hover: { bg: "gray.200" },
                    color: "gray.700"
                  }}
                  cursor="pointer"
                  transition="all 0.2s"
                  maxW="100%"
                >
                  <FiFileText size={12} color="currentColor" />
                  <Text fontSize="11px" fontWeight="medium" noOfLines={1} isTruncated>
                    {download.name}
                  </Text>
                </HStack>
              ))}
            </Flex>
          )}
        </Box>
        <Text fontSize="10px" color="whiteAlpha.600" _light={{ color: "gray.500" }} px={1}>{formatTime(msg.timestamp)}</Text>
      </VStack>
    </Flex>
  );
});

export default MessageItem;
