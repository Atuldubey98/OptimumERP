import React from "react";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { FiCpu } from "react-icons/fi";

const EmptyState = () => (
  <Flex 
    direction="column" 
    align="center" 
    justify="center" 
    flex="1" 
    py={20}
    opacity={0.6}
  >
    <Icon as={FiCpu} fontSize="4xl" color="blue.500" mb={4} />
    <Text fontWeight="600" fontSize="md">Say Hi 👋 !</Text>
    <Text fontSize="sm">Start a conversation with OptiBot!</Text>
  </Flex>
);

export default EmptyState;
