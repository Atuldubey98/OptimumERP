import React from "react";
import { Flex, Box, HStack, Spinner, Text, useColorModeValue } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";

const TypingIndicator = ({ statusMsg }) => {
  const bg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "transparent");
  const borderWidth = useColorModeValue("1px", "0px");

  return (
    <Flex justify="flex-start">
      <Box p={3} borderRadius="xl" bg={bg} borderWidth={borderWidth} borderColor={borderColor}>
        <HStack spacing={2}>
          <Spinner size="xs" color="blue.400" />
          <AnimatePresence mode="wait">
            <motion.div 
              key={statusMsg} 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -5 }} 
              transition={{ duration: 0.2 }}
            >
              <Text fontSize="12px" color="gray.400" _light={{ color: "gray.500" }}>{statusMsg}</Text>
            </motion.div>
          </AnimatePresence>
        </HStack>
      </Box>
    </Flex>
  );
};

export default TypingIndicator;
