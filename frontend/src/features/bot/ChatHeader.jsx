import React, { memo } from "react";
import { Flex, HStack, Circle, Box, Text, IconButton } from "@chakra-ui/react";
import { RiRobot2Line } from "react-icons/ri";
import { FiX } from "react-icons/fi";

const ChatHeader = memo(({ isConnected, onToggle }) => {
  return (
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
      <IconButton aria-label="Close" variant="ghost" size="sm" color="white" icon={<FiX size={18} />} onClick={onToggle} />
    </Flex>
  );
});

export default ChatHeader;
