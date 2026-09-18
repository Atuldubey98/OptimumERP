import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { FiCornerDownRight, FiCpu } from "react-icons/fi";

const EmptyState = ({ defaultIceBreakers = [], onSelectIceBreaker }) => {
  const chipBg = useColorModeValue("white", "gray.800");
  const chipBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const hoverBg = useColorModeValue("blue.50", "whiteAlpha.200");
  const hoverBorder = useColorModeValue("blue.300", "blue.400");

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      flex="1"
      py={6}
      px={2}
    >
      <Box textAlign="center" mb={defaultIceBreakers?.length ? 6 : 10} opacity={0.85}>
        <Icon as={FiCpu} fontSize="4xl" color="blue.500" mb={3} />
        <Text fontWeight="600" fontSize="md">Say Hi 👋 !</Text>
        <Text fontSize="xs" color="gray.500">Start a conversation with OptiBot!</Text>
      </Box>

      {defaultIceBreakers && defaultIceBreakers.length > 0 && (
        <VStack spacing={2} width="100%" align="stretch">
          <Text
            fontSize="10px"
            fontWeight="bold"
            color="gray.400"
            textTransform="uppercase"
            letterSpacing="wider"
            textAlign="center"
            mb={1}
          >
            Suggested Starters
          </Text>
          {defaultIceBreakers.map((prompt, idx) => (
            <Button
              key={idx}
              size="sm"
              variant="outline"
              bg={chipBg}
              borderColor={chipBorder}
              borderRadius="xl"
              leftIcon={<FiCornerDownRight size={13} color="#3182ce" />}
              fontSize="xs"
              fontWeight="500"
              py={2.5}
              px={3}
              height="auto"
              whiteSpace="normal"
              textAlign="left"
              justifyContent="flex-start"
              boxShadow="sm"
              onClick={() => onSelectIceBreaker && onSelectIceBreaker(prompt)}
              _hover={{
                bg: hoverBg,
                borderColor: hoverBorder,
                transform: "translateY(-1px)",
                boxShadow: "md",
              }}
              transition="all 0.15s ease"
            >
              <Text noOfLines={2}>{prompt}</Text>
            </Button>
          ))}
        </VStack>
      )}
    </Flex>
  );
};

export default EmptyState;
