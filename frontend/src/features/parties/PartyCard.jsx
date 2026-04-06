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
  Tooltip,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";

function CopyableText({ value, children, ...props }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <Tooltip label={copied ? "Copied!" : value} placement="top" isDisabled={!value}>
      <Box
        as="span"
        onClick={handleCopy}
        cursor={value ? "pointer" : undefined}
        {...props}
      >
        {children}
      </Box>
    </Tooltip>
  );
}

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
              <CopyableText value={party.gstNo}>
                <Badge borderRadius="full" px={3} py={1} bg={surfaceBg} textTransform="none" flexShrink={0} maxW="28" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" display="block">
                  {party.gstNo}
                </Badge>
              </CopyableText>
            ) : null}
          </Flex>

          <Box>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={subtleTextColor}>
              Billing Address
            </Text>
            <Text mt={1} noOfLines={2}>
              {party.billingAddress || "Not set"}
            </Text>
          </Box>

          <Flex gap={6} wrap="wrap">
            <Box>
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={subtleTextColor}>
                GST No
              </Text>
              <CopyableText value={party.gstNo || undefined}>
                <Text mt={1} noOfLines={1} maxW="28">{party.gstNo || "Not set"}</Text>
              </CopyableText>
            </Box>
            <Box>
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={subtleTextColor}>
                PAN No
              </Text>
              <CopyableText value={party.panNo || undefined}>
                <Text mt={1} noOfLines={1} maxW="28">{party.panNo || "Not set"}</Text>
              </CopyableText>
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