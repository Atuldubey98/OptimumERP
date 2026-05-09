import React, { memo } from "react";
import { Flex, HStack, Circle, Box, Text, IconButton } from "@chakra-ui/react";
import { RiRobot2Line } from "react-icons/ri";
import { FiX, FiRefreshCw } from "react-icons/fi";
import { motion, useAnimation } from "framer-motion";

const ChatHeader = memo(({ isConnected, onToggle, onReset, showReset }) => {
  const controls = useAnimation();

  const handleReset = async () => {
    controls.start({
      rotate: -360,
      transition: { duration: 0.5, ease: "easeInOut" }
    });
    onReset();
  };

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
      <HStack gap={1}>
        {showReset && (
          <IconButton 
            aria-label="Reset Chat" 
            variant="ghost" 
            size="sm" 
            color="white" 
            icon={
              <motion.div animate={controls}>
                <FiRefreshCw size={16} />
              </motion.div>
            } 
            onClick={handleReset}
            _hover={{ bg: "whiteAlpha.200" }}
          />
        )}
        <IconButton aria-label="Close" variant="ghost" size="sm" color="white" icon={<FiX size={18} />} onClick={onToggle} />
      </HStack>
    </Flex>
  );
});

export default ChatHeader;
