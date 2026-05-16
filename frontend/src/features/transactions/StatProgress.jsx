import { Box, Progress, Text, Tooltip, useColorModeValue } from "@chakra-ui/react";
import React from "react";

export default function StatProgress({ value, progress, colorScheme = "blue" }) {
  const trackColor = useColorModeValue("gray.100", "gray.700");
  
  return (
    <Box w="100%">
      {value && (
        <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.600">
          {value}
        </Text>
      )}
      <Tooltip label={`${progress.toFixed(2)}%`}>
        <Progress
          value={progress}
          colorScheme={colorScheme}
          borderRadius="full"
          size="sm"
          bg={trackColor}
          hasStripe
          isAnimated
        />
      </Tooltip>
    </Box>
  );
}
