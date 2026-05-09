import { Box, Flex, HStack, VStack, Text, Avatar, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import { FiMessageSquare } from "react-icons/fi";
import moment from "moment";

const ConversationItem = ({ chat, isActive, onClick }) => {
  const bg = useColorModeValue(isActive ? "gray.100" : "transparent", isActive ? "whiteAlpha.200" : "transparent");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const lastMessage = chat.messages?.[0];

  return (
    <Box
      p={4}
      cursor="pointer"
      bg={bg}
      _hover={{ bg: hoverBg }}
      transition="all 0.2s"
      onClick={onClick}
      borderRadius="lg"
      mb={1}
    >
      <HStack spacing={3} align="flex-start">
        <Avatar size="sm" icon={<FiMessageSquare />} bg="blue.500" color="white" />
        <VStack align="flex-start" spacing={0} flex={1} overflow="hidden">
          <HStack w="100%" justify="space-between">
            <Text fontWeight="600" fontSize="sm" isTruncated>
              {chat.title || "New Conversation"}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {moment(chat.updatedAt).format("MMM D")}
            </Text>
          </HStack>
          <Text fontSize="xs" color="gray.500" noOfLines={1}>
            {lastMessage?.content || "No messages yet"}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

export default ConversationItem;
