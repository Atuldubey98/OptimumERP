import React, { memo } from "react";
import { Flex, Box, VStack, Text, Image, HStack, useColorModeValue } from "@chakra-ui/react";
import { FiFileText, FiCpu, FiDownload } from "react-icons/fi";
import MarkdownRenderer from "./MarkdownRenderer";

const toolDisplayMap = {
  download_report: "Generating report link...",
  download_bill: "Preparing document download...",
  find_bills: "Searching documents...",
  find_bill: "Retrieving document details...",
  create_bill: "Generating billing document...",
  get_party: "Fetching customer details...",
  get_parties: "Fetching customer details...",
  create_party: "Creating customer record...",
  get_party_ledger: "Loading account ledger...",
  get_product_details: "Searching products...",
  create_product: "Creating item...",
  create_contact: "Creating contact...",
  get_contacts: "Retrieving contact details...",
  send_email: "Sending email...",
  create_payment_voucher: "Creating payment voucher...",
  find_payment_voucher: "Fetching payment voucher...",
  list_expenses: "Listing expenses...",
  create_expense: "Creating expense...",
  list_expense_categories: "Listing expense categories...",
  create_expense_category: "Creating expense category...",
  get_activity_log: "Fetching history...",
  get_business_stats: "Fetching business performance data...",
  list_document_vouchers: "Fetching list of vouchers...",
};
import { baseURL } from "../../instance";

const MessageItem = memo(({ msg, formatTime }) => {
  const toolBg = useColorModeValue("blue.50", "whiteAlpha.100");
  const toolBorder = useColorModeValue("blue.100", "whiteAlpha.200");
  const toolIconColor = useColorModeValue("#3182ce", "#63b3ed");
  const toolTextColor = useColorModeValue("blue.700", "blue.200");

  return (
    <Flex justify={msg.role === "user" ? "flex-end" : "flex-start"} direction="column" align={msg.role === "user" ? "flex-end" : "flex-start"}>
      {msg.attachment && (
        <Box mb={2} maxW="70%">
          {msg.attachment.type.startsWith("image/") ? (
            <Image src={msg.attachment.data} borderRadius="md" alt="upload" fallbackSrc="https://via.placeholder.com/150" />
          ) : (
            <HStack p={2} bg="whiteAlpha.200" borderRadius="md" _light={{ bg: "gray.100" }}>
              <FiFileText color="#EDF2F7" />
              <Text fontSize="xs" noOfLines={1} color="white" _light={{ color: "gray.800" }}>{msg.attachment.name}</Text>
            </HStack>
          )}
        </Box>
      )}
      <VStack align={msg.role === "user" ? "flex-end" : "flex-start"} spacing={1} maxW="92%">
        {msg.tool_calls && msg.tool_calls.length > 0 && (
          <Flex wrap="wrap" gap={1} mb={1} width="100%">
            {[...new Set(msg.tool_calls.map(t => t.function.name))].map((toolName, idx) => (
              <HStack 
                key={idx} 
                px={2} 
                py={1} 
                bg={toolBg} 
                borderRadius="md" 
                borderWidth="1px" 
                borderColor={toolBorder} 
                spacing={1.5}
              >
                <FiCpu size={12} color={toolIconColor} />
                <Text fontSize="10px" fontWeight="600" color={toolTextColor} textTransform="uppercase" letterSpacing="wider">
                  {toolDisplayMap[toolName] || toolName}
                </Text>
              </HStack>
            ))}
          </Flex>
        )}
        <Box 
          p={3} 
          borderRadius="xl" 
          bg={msg.role === "user" ? "blue.500" : "gray.700"} 
          color="white" 
          boxShadow="sm" 
          _light={{ 
            bg: msg.role === "user" ? "blue.600" : "white", 
            color: msg.role === "user" ? "white" : "gray.800", 
            borderWidth: msg.role !== "user" ? "1px" : "0px", 
            borderColor: "gray.200" 
          }}
          maxW="100%"
          overflow="hidden"
        >
          {msg.content && <MarkdownRenderer content={msg.content} />}
          {!msg.content && msg.tool_calls && <Text fontSize="xs" fontStyle="italic" opacity={0.8}>Processing request...</Text>}
        </Box>
        {msg.downloads && msg.downloads.length > 0 && (
          <VStack align="stretch" spacing={2} width="100%" mt={1.5}>
            {msg.downloads.map((download, idx) => {
              const downloadUrl = download.url.startsWith("http") ? download.url : `${baseURL || ""}${download.url}`;
              return (
                <HStack
                  key={idx}
                  as="a"
                  href={downloadUrl}
                  download={download.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  p={2.5}
                  bg={useColorModeValue("gray.50", "whiteAlpha.100")}
                  borderWidth="1px"
                  borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
                  borderRadius="lg"
                  cursor="pointer"
                  _hover={{
                    bg: useColorModeValue("gray.100", "whiteAlpha.200"),
                    textDecoration: "none"
                  }}
                  spacing={3}
                  width="100%"
                  transition="all 0.2s"
                >
                  <Flex
                    p={2}
                    bg="blue.500"
                    color="white"
                    borderRadius="md"
                    align="center"
                    justify="center"
                  >
                    <FiDownload size={16} />
                  </Flex>
                  <VStack align="flex-start" spacing={0} flex={1} overflow="hidden">
                    <Text
                      fontSize="xs"
                      fontWeight="600"
                      color={useColorModeValue("gray.800", "white")}
                      noOfLines={1}
                    >
                      {download.name || "Download Document"}
                    </Text>
                    <Text
                      fontSize="10px"
                      color={useColorModeValue("gray.500", "whiteAlpha.600")}
                    >
                      Click to download
                    </Text>
                  </VStack>
                </HStack>
              );
            })}
          </VStack>
        )}
        <Text fontSize="10px" color="whiteAlpha.600" _light={{ color: "gray.500" }} px={1}>
          {formatTime(msg.timestamp || msg.createdAt)}
        </Text>
      </VStack>
    </Flex>
  );
});

export default MessageItem;
