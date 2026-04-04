import { Box, Heading, Stack, Text } from "@chakra-ui/react";
import React from "react";

export default function DashboardPageHeader({
  greeting,
  userName,
  subtitle,
  actions,
}) {
  return (
    <Box
      borderRadius="2xl"
      px={{ base: 4, md: 6 }}
      py={{ base: 5, md: 6 }}
    >
      <Stack
        direction={{ base: "column", lg: "row" }}
        justify="space-between"
        align={{ base: "flex-start", lg: "center" }}
        spacing={4}
      >
        <Stack spacing={1} maxW="3xl">
          <Heading fontSize={{ base: "2xl", md: "3xl" }} lineHeight="short">
            {greeting} <strong>{userName}</strong>
          </Heading>
          <Text color="gray.600">{subtitle}</Text>
        </Stack>
        <Box w={{ base: "100%", md: "280px" }} flexShrink={0}>
          {actions}
        </Box>
      </Stack>
    </Box>
  );
}