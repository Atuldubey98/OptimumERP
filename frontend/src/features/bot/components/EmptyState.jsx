import { Box, Button, Flex, Icon, SimpleGrid, Text } from "@chakra-ui/react";
import { FiCpu, FiFileText, FiPieChart, FiPlusCircle, FiUsers } from "react-icons/fi";

const SUGGESTIONS = [
  { text: "What's my sales this month?", icon: FiPieChart },
  { text: "Show pending invoices", icon: FiFileText },
  { text: "Create a new contact", icon: FiPlusCircle },
  { text: "Top 5 customers this year", icon: FiUsers },
];

const EmptyState = ({ onSuggestionClick }) => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    flex="1"
    py={10}
  >
    <Box textAlign="center" mb={10} opacity={0.6}>
      <Icon as={FiCpu} fontSize="4xl" color="blue.500" mb={4} />
      <Text fontWeight="600" fontSize="md">Say Hi 👋 !</Text>
      <Text fontSize="sm">Start a conversation with OptiBot!</Text>
    </Box>

    <Box width="100%">
      <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={3} textAlign="center" textTransform="uppercase" letterSpacing="wider">
        Quick Actions
      </Text>
      <SimpleGrid columns={1} spacing={2} width="100%">
        {SUGGESTIONS.map((s, i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            justifyContent="flex-start"
            leftIcon={<Icon as={s.icon} />}
            onClick={() => onSuggestionClick(s.text)}
            fontSize="xs"
            fontWeight="medium"
            borderRadius="xl"
            py={5}
            whiteSpace="normal"
            textAlign="left"
            _hover={{
              bg: "blue.50",
              color: "blue.600",
              borderColor: "blue.200",
              transform: "translateY(-1px)",
              boxShadow: "sm"
            }}
            _dark={{
              _hover: {
                bg: "whiteAlpha.100",
                color: "blue.300",
                borderColor: "blue.500"
              }
            }}
            transition="all 0.2s"
          >
            {s.text}
          </Button>
        ))}
      </SimpleGrid>
    </Box>
  </Flex>
);

export default EmptyState;
