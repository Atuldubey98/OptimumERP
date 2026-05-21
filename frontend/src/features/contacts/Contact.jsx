import React, { useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  HStack,
  Link,
  IconButton,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useParams } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin2Line } from "react-icons/ri";

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

export default function Contact({ item, onDeleteContact, onEditContact }) {
  const { orgId } = useParams();
  const { t } = useTranslation("contact");
  const subtleTextColor = useColorModeValue("gray.500", "gray.400");
  const surfaceBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Card
      key={item._id}
      borderRadius="2xl"
      h="100%"
      transition="all 0.2s"
      _hover={{ shadow: "md", transform: "translateY(-2px)" }}
    >
      <CardHeader>
        <Flex justifyContent="space-between" gap={4} alignItems="flex-start">
          <HStack spacing={3} align="flex-start" minW="0" flex={1}>
            <Avatar size="md" name={item.name} />
            <Box minW="0" flex={1}>
              <CopyableText value={item._id}>
                <Text
                  noOfLines={2}
                  textOverflow="ellipsis"
                  wordBreak="break-word"
                  fontSize="lg"
                  fontWeight="semibold"
                >
                  {item.name}
                </Text>
              </CopyableText>
              <CopyableText value={item.telephone}>
                <Link noOfLines={1} href={`tel:${item.telephone}`} color={subtleTextColor}>
                  {item.telephone}
                </Link>
              </CopyableText>
            </Box>
          </HStack>
          <CopyableText value={item.type}>
            <Badge borderRadius="full" px={3} py={1} bg={surfaceBg} textTransform="none" maxW="24" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" display="block" cursor="default">
              {item.type}
            </Badge>
          </CopyableText>
        </Flex>
      </CardHeader>
      <CardBody pt={0} fontSize="sm">
        <Stack spacing={4}>
          <Box>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={subtleTextColor}>
              {t("contact_ui.card.email")}
            </Text>
            {item.email ? (
              <CopyableText value={item.email}>
                <Link href={`mailto:${item.email}`} noOfLines={1} display="block">{item.email}</Link>
              </CopyableText>
            ) : (
              <Text color={subtleTextColor}>{t("contact_ui.card.not_set")}</Text>
            )}
          </Box>
          <Box>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={subtleTextColor}>
              {t("contact_ui.card.company_name")}
            </Text>
            {item.party ? (
              <CopyableText value={item.party._id}>
                <Link
                  as={RouterLink}
                  to={`/${orgId}/parties/${item.party._id}/transactions`}
                  noOfLines={1}
                >
                  {item.party.name}
                </Link>
              </CopyableText>
            ) : (
              <Text color={subtleTextColor}>{t("contact_ui.card.not_set")}</Text>
            )}
          </Box>
        </Stack>
      </CardBody>
      <CardFooter>
        <ButtonGroup justifyContent="flex-end" alignItems="center" ml="auto">
          <IconButton
            isRound
            size="sm"
            icon={<CiEdit />}
            aria-label={t("contact_ui.actions.edit")}
            onClick={onEditContact}
          />
          <IconButton
            size="sm"
            isRound
            icon={<RiDeleteBin2Line color="red" />}
            aria-label={t("contact_ui.actions.delete")}
            onClick={onDeleteContact}
          />
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
