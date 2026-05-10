import React from "react";
import { Flex, Icon, Text, Button } from "@chakra-ui/react";
import { FiSettings, FiAlertTriangle } from "react-icons/fi";

const SetupRequired = ({ orgId, onNavigate }) => (
  <Flex 
    direction="column" 
    align="center" 
    justify="center" 
    flex="1" 
    py={20}
    px={10}
    textAlign="center"
  >
    <Icon as={FiAlertTriangle} fontSize="4xl" color="orange.400" mb={4} />
    <Text fontWeight="600" fontSize="md" mb={2}>AI Setup Required</Text>
    <Text fontSize="xs" color="gray.500" mb={6}>
      No AI providers are configured or active for this organization. Please set up a provider to start chatting.
    </Text>
    <Button 
      leftIcon={<FiSettings />} 
      colorScheme="blue" 
      size="sm" 
      onClick={onNavigate}
    >
      Go to Settings
    </Button>
  </Flex>
);

export default SetupRequired;
