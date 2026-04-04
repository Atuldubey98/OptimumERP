import {
  Badge,
  Box,
  Card,
  CardBody,
  CardFooter,
  Flex,
  Heading,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";

export default function PartyCard({ party, actions }) {
  const subtleTextColor = useColorModeValue("gray.500", "gray.400");
  const surfaceBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Card borderRadius="2xl" h="100%">
      <CardBody>
        <Stack spacing={4}>
          <Flex justify="space-between" align="flex-start" gap={3}>
            <Box minW={0}>
              <Heading fontSize="lg" noOfLines={2} lineHeight="short">
                {party.name}
              </Heading>
            </Box>
            {party.gstNo ? (
              <Badge borderRadius="full" px={3} py={1} bg={surfaceBg} textTransform="none" flexShrink={0}>
                {party.gstNo}
              </Badge>
            ) : null}
          </Flex>

          <Box>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={subtleTextColor}>
              Billing Address
            </Text>
            <Text mt={1} noOfLines={3}>
              {party.billingAddress || "Not set"}
            </Text>
          </Box>

          <Flex gap={6} wrap="wrap">
            <Box>
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={subtleTextColor}>
                GST No
              </Text>
              <Text mt={1}>{party.gstNo || "Not set"}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={subtleTextColor}>
                PAN No
              </Text>
              <Text mt={1}>{party.panNo || "Not set"}</Text>
            </Box>
          </Flex>
        </Stack>
      </CardBody>
      <CardFooter pt={0}>
        <Flex ml="auto">{actions}</Flex>
      </CardFooter>
    </Card>
  );
}