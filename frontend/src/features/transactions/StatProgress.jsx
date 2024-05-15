import { Box, Progress, Text, Tooltip } from "@chakra-ui/react";
import React from "react";

export default function StatProgress({ value, progress }) {
  return (
    <Box>
      <Text fontSize={"sm"} textTransform={"capitalize"}>
        {value}
      </Text>
      <Tooltip label={`${progress.toFixed(2)} %`}>
        <Box marginBlock={1}>
          <Progress value={progress} colorScheme="blue" />
        </Box>
      </Tooltip>
    </Box>
  );
}
