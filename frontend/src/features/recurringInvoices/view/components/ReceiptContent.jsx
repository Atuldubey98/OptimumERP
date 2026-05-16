import {
  Box,
  Divider,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import moment from "moment";
import useCurrentOrgCurrency from "../../../../hooks/useCurrentOrgCurrency";

export default function ReceiptContent({ ri }) {
  const { formatSmallestUnitWithSymbol } = useCurrentOrgCurrency();
  const grandTotal = Number(ri.total || 0) + Number(ri.totalTax || 0) + Number(ri.shippingCharges || 0);

  const cardBg = useColorModeValue("white", "gray.800");
  const secondaryBg = useColorModeValue("gray.50", "gray.700");
  const secondaryText = useColorModeValue("gray.600", "gray.400");
  const mutedText = useColorModeValue("gray.500", "gray.500");

  return (
    <Box bg={cardBg} p={8} borderRadius="2xl" shadow="sm">
      <Flex justify="space-between" mb={10} direction={{ base: "column", md: "row" }} gap={6}>
        <VStack align="start" spacing={2}>
          <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">
            Billing To
          </Text>
          <Text fontSize="xl" fontWeight="bold">{ri.party?.name}</Text>
          <Text color={secondaryText} fontSize="sm" whiteSpace="pre-wrap">
            {ri.billingAddress}
          </Text>
          {ri.party?.gstNo && (
            <Badge colorScheme="blue" variant="subtle" px={2} py={1} borderRadius="md">
              GST: {ri.party.gstNo}
            </Badge>
          )}
        </VStack>
        <VStack align={{ base: "start", md: "end" }} spacing={1}>
          <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">
            Plan Details
          </Text>
          <Text fontSize="sm"><b>Starts:</b> {moment(ri.startDate).format("LL")}</Text>
          <Text fontSize="sm"><b>Ends:</b> {ri.endDate ? moment(ri.endDate).format("LL") : "Never"}</Text>
          <Text fontSize="sm"><b>Last Run:</b> {ri.lastGeneratedDate ? moment(ri.lastGeneratedDate).format("LL") : "Never"}</Text>
        </VStack>
      </Flex>

      <Divider mb={6} />

      <Table variant="simple" size="sm" mb={8}>
        <Thead>
          <Tr>
            <Th px={0}>Item Description</Th>
            <Th isNumeric>Qty</Th>
            <Th isNumeric>Price</Th>
            <Th isNumeric>Tax</Th>
            <Th isNumeric px={0}>Amount</Th>
          </Tr>
        </Thead>
        <Tbody>
          {ri.items?.map((item, idx) => (
            <Tr key={idx}>
              <Td px={0} py={4}>
                <Text fontWeight="medium">{item.name}</Text>
                {item.code && <Text fontSize="xs" color="gray.500">Code: {item.code}</Text>}
              </Td>
              <Td isNumeric>{item.quantity} {item.um?.unit}</Td>
              <Td isNumeric>{formatSmallestUnitWithSymbol(item.price)}</Td>
              <Td isNumeric>{item.tax?.name}</Td>
              <Td isNumeric px={0} fontWeight="semibold">
                {formatSmallestUnitWithSymbol(item.price * item.quantity)}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Flex justify="flex-end">
        <VStack align="stretch" spacing={3} minW="250px">
          <Flex justify="space-between">
            <Text color={mutedText}>Subtotal</Text>
            <Text fontWeight="medium">{formatSmallestUnitWithSymbol(ri.total)}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color={mutedText}>Total Tax</Text>
            <Text fontWeight="medium">{formatSmallestUnitWithSymbol(ri.totalTax)}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color={mutedText}>Shipping</Text>
            <Text fontWeight="medium">{formatSmallestUnitWithSymbol(ri.shippingCharges || 0)}</Text>
          </Flex>
          <Divider />
          <Flex justify="space-between" fontSize="lg">
            <Text fontWeight="bold">Grand Total</Text>
            <Text fontWeight="bold" color="blue.600">
              {formatSmallestUnitWithSymbol(grandTotal)}
            </Text>
          </Flex>
        </VStack>
      </Flex>

      {(ri.description || ri.terms) && (
        <Box mt={10} p={4} bg={secondaryBg} borderRadius="xl">
          {ri.description && (
            <Box mb={ri.terms ? 4 : 0}>
              <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={1}>
                Description
              </Text>
              <Text fontSize="sm" color={secondaryText}>{ri.description}</Text>
            </Box>
          )}
          {ri.terms && (
            <Box>
              <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={1}>
                Terms & Conditions
              </Text>
              <Text fontSize="sm" color={secondaryText}>{ri.terms}</Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
