import { Box, Flex, HStack, VStack, Text, Avatar, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import { FiMessageSquare, FiCpu } from "react-icons/fi";
import moment from "moment";
import MarkdownRenderer from "../bot/MarkdownRenderer";

const toolLabelMap = {
  download_report: "Report Link",
  download_bill: "Document",
  find_bills: "Bill Search",
  find_bill: "Bill Details",
  create_bill: "Bill Creation",
  get_party: "Party Details",
  get_parties: "Parties List",
  create_party: "Party Creation",
  get_party_ledger: "Ledger",
  get_product_details: "Product Search",
  create_product: "Product Creation",
  create_contact: "Contact Creation",
  create_payment_voucher: "Payment Voucher",
  find_payment_voucher: "Voucher Search",
  list_expenses: "Expenses List",
  create_expense: "Expense Creation",
  list_expense_categories: "Expense Categories",
  create_expense_category: "Category Creation",
};

const ConversationItem = ({ chat, isActive, onClick }) => {
  const bg = useColorModeValue(isActive ? "gray.100" : "transparent", isActive ? "whiteAlpha.200" : "transparent");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const lastMessage = chat.messages?.[0];

  const getSnippet = () => {
    if (lastMessage?.content) {
      const content = lastMessage.content.trim();
      if (
        content.startsWith("```") ||
        content.includes("```") ||
        content.startsWith("const ") ||
        content.startsWith("import ") ||
        content.startsWith("function ") ||
        content.startsWith("{") ||
        content.startsWith("[")
      ) {
        return "--";
      }
      const cleanText = content
        .replace(/[#*`_\-]/g, "")
        .replace(/\n+/g, " ")
        .trim();
      return cleanText || "--";
    }
    if (lastMessage?.tool_calls?.length > 0) {
      const labels = lastMessage.tool_calls.map(tc => toolLabelMap[tc.function.name] || tc.function.name);
      return <Text as="span" fontStyle="italic">{labels.join(", ")}</Text>;
    }
    return "No messages yet";
  };

  return (
    <Box
      p={4}
      cursor="pointer"
      bg={bg}
      _hover={{ bg: hoverBg }}
      transition="all 0.2s"
      onClick={onClick}
      borderRadius="lg"
      mb={1}
    >
      <HStack spacing={3} align="flex-start">
        <Avatar size="sm" icon={<FiMessageSquare />} bg="blue.500" color="white" />
        <VStack align="flex-start" spacing={0} flex={1} overflow="hidden">
          <HStack w="100%" justify="space-between">
            <Text fontWeight="600" fontSize="sm" isTruncated>
              {chat.title || "New Conversation"}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {moment(chat.updatedAt).format("MMM D")}
            </Text>
          </HStack>
          <Box fontSize="xs" color="gray.500" noOfLines={1} w="100%">
            {getSnippet()}
          </Box>
        </VStack>
      </HStack>
    </Box>
  );
};

export default ConversationItem;
