import {
  Box,
  Card,
  CardBody,
  Flex,
  Heading,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";

export default function Dashcard({
  dashType = "invoice",
  dashTotal = "123",
  period,
  icon,
}) {
  const { t } = useTranslation("dashboard");
  const bg = useColorModeValue("gray.100", "gray.800");
  const iconColor = useColorModeValue("gray.700", "white");
  const resolvedPeriod = period || t("dashboard_ui.periods.this_month");
  return (
    <Card w="100%" h="100%" borderRadius="2xl">
      <CardBody>
        <Stack spacing={5} h="100%" justify="space-between">
          <Flex justify="space-between" align="flex-start" gap={4}>
            <Stack spacing={1.5}>
              <Text fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="widest">
                {resolvedPeriod}
              </Text>
              <Heading fontSize={{ base: "lg", md: "xl" }} lineHeight="short">
                {dashType}
              </Heading>
            </Stack>
            <Flex
              align="center"
              justify="center"
              borderRadius="full"
              p={4}
              bg={bg}
              color={iconColor}
              minW="64px"
              minH="64px"
            >
              {icon}
            </Flex>
          </Flex>
          <Stack spacing={1}>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" lineHeight="1">
              {dashTotal}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {dashType}
            </Text>
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  );
}
