import {
  Box,
  Card,
  CardBody,
  Flex,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";

export default function QuickAccessActionCard({
  icon,
  label,
  description,
  onClick,
}) {
  const iconBg = useColorModeValue("gray.100", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Card
      onClick={onClick}
      cursor="pointer"
      h="100%"
      borderRadius="2xl"
      transition="background-color 0.2s ease, transform 0.2s ease"
      _hover={{
        bg: hoverBg,
        transform: "translateY(-1px)",
      }}
    >
      <CardBody>
        <Flex align="center" gap={4}>
          <Flex
            align="center"
            justify="center"
            borderRadius="xl"
            bg={iconBg}
            minW="64px"
            minH="64px"
            px={3}
          >
            {icon}
          </Flex>
          <Box>
            <Heading fontSize="md" lineHeight="short">
              {label}
            </Heading>
            <Text mt={1} fontSize="sm" color="gray.500">
              {description}
            </Text>
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
}