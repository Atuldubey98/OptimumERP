import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Spinner,
  Avatar,
  IconButton,
} from "@chakra-ui/react";
import React, { useRef, useEffect } from "react";
import { FiMessageSquare, FiChevronLeft, FiClock } from "react-icons/fi";
import moment from "moment";
import MessageItem from "../bot/MessageItem";

const ChatWindow = ({ 
  chatId, 
  currentChat, 
  loading, 
  isMobile, 
  onBack, 
  formatTime 
}) => {
  const scrollRef = useRef(null);
  const headerBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const messageAreaBg = useColorModeValue("gray.50", "#131720");
  const headerBorderColor = useColorModeValue("gray.100", "whiteAlpha.100");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [currentChat?.messages]);

  if (!chatId) {
    return (
      <Flex 
        direction="column" 
        align="center" 
        justify="center" 
        h="100%" 
        opacity={0.6} 
        p={10} 
        textAlign="center"
        bg={headerBg}
      >
        <Icon as={FiMessageSquare} fontSize="6xl" color="blue.500" mb={4} />
        <Heading size="md" mb={2}>Select a conversation</Heading>
        <Text fontSize="sm">Choose a conversation from the list to view the history.</Text>
      </Flex>
    );
  }

  if (loading) {
    return (
      <Flex align="center" justify="center" h="100%" bg={headerBg}>
        <Spinner size="lg" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Flex 
      direction="column" 
      h="100%" 
      bg={headerBg} 
      borderRadius={{ md: "xl" }} 
      borderLeftWidth={{ md: "1px" }} 
      borderColor={borderColor}
    >
      <Flex p={4} borderBottomWidth="1px" borderColor={headerBorderColor} align="center" gap={3}>
        {isMobile && (
          <IconButton
            icon={<FiChevronLeft size={20} />}
            variant="ghost"
            onClick={onBack}
            aria-label="Back to list"
          />
        )}
        <Avatar size="sm" icon={<FiMessageSquare />} bg="blue.500" color="white" />
        <VStack align="flex-start" spacing={0}>
          <Text fontWeight="bold" fontSize="md">
            {currentChat?.title || "Conversation"}
          </Text>
          <HStack spacing={1} color="gray.500" fontSize="xs">
            <Icon as={FiClock} />
            <Text>Updated {moment(currentChat?.updatedAt).fromNow()}</Text>
          </HStack>
        </VStack>
      </Flex>

      <Box flex={1} overflowY="auto" p={4} ref={scrollRef} bg={messageAreaBg}>
        <VStack align="stretch" spacing={4}>
          {currentChat?.messages?.filter(msg=>msg.role !== "tool").map((msg, idx) => (
            <MessageItem key={idx} msg={msg} formatTime={formatTime} />
          ))}
        </VStack>
      </Box>
    </Flex>
  );
};

export default ChatWindow;
