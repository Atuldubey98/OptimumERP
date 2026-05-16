import {
  Box,
  Heading,
  Icon,
  VStack,
  Text,
  Flex,
  Badge,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdHistory } from "react-icons/md";
import { Link } from "react-router-dom";
import moment from "moment";
import useCurrentOrgCurrency from "../../../../hooks/useCurrentOrgCurrency";

export default function HistorySidebar({ ri, orgId }) {
  const { formatSmallestUnitWithSymbol } = useCurrentOrgCurrency();

  const historyItems = [...(ri.invoices || []), ...(ri.proformaInvoices || [])];

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const itemHoverBg = useColorModeValue("gray.50", "gray.700");

  return (
    <VStack align="stretch" spacing={6}>
      <Box bg={cardBg} p={6} borderRadius="2xl" shadow="sm">
        <Heading size="md" mb={4} display="flex" align="center" gap={2}>
          <Icon as={MdHistory} color="blue.500" />
          Generated History
        </Heading>
        <VStack align="stretch" spacing={4}>
          {historyItems.length === 0 ? (
            <Text color="gray.400" fontSize="sm" textAlign="center" py={4}>
              No documents generated yet.
            </Text>
          ) : (
            <>
              {ri.invoices?.length > 0 && (
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2}>
                    Invoices
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    {ri.invoices.map((inv) => (
                      <Flex
                        key={inv._id}
                        p={3}
                        borderRadius="lg"
                        border="1px"
                        borderColor={borderColor}
                        justify="space-between"
                        align="center"
                        _hover={{ bg: itemHoverBg }}
                        as={Link}
                        to={`/${orgId}/receipt/invoices/${inv._id}`}
                      >
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" fontSize="sm">{inv.num}</Text>
                          <Text fontSize="xs" color="gray.500">{moment(inv.date).format("LL")}</Text>
                        </VStack>
                        <Text fontWeight="bold" color="blue.600" fontSize="sm">
                          {formatSmallestUnitWithSymbol(Number(inv.total || 0) + Number(inv.totalTax || 0))}
                        </Text>
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              )}
              {ri.proformaInvoices?.length > 0 && (
                <Box mt={4}>
                  <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2}>
                    Proforma Invoices
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    {ri.proformaInvoices.map((pi) => (
                      <Flex
                        key={pi._id}
                        p={3}
                        borderRadius="lg"
                        border="1px"
                        borderColor={borderColor}
                        justify="space-between"
                        align="center"
                        _hover={{ bg: itemHoverBg }}
                        as={Link}
                        to={`/${orgId}/receipt/proformaInvoices/${pi._id}`}
                      >
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" fontSize="sm">{pi.num}</Text>
                          <Text fontSize="xs" color="gray.500">{moment(pi.date).format("LL")}</Text>
                        </VStack>
                        <Text fontWeight="bold" color="blue.600" fontSize="sm">
                          {formatSmallestUnitWithSymbol(Number(pi.total || 0) + Number(pi.totalTax || 0))}
                        </Text>
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              )}
            </>
          )}
        </VStack>
      </Box>

      <Box bg="blue.600" p={6} borderRadius="2xl" shadow="md" color="white">
        <Heading size="sm" mb={2}>Automatic Generation</Heading>
        <Text fontSize="sm" opacity={0.9} mb={4}>
          This recurring invoice is set to automatically generate:
        </Text>
        <VStack align="start" spacing={2}>
          {ri.generateInvoice && (
            <Badge colorScheme="whiteAlpha" px={2} py={1} borderRadius="md" color="white">
              Standard Invoice
            </Badge>
          )}
          {ri.generateProformaInvoice && (
            <Badge colorScheme="whiteAlpha" px={2} py={1} borderRadius="md" color="white">
              Proforma Invoice
            </Badge>
          )}
        </VStack>
        <Divider my={4} opacity={0.3} />
        <Text fontSize="xs" fontStyle="italic" opacity={0.8}>
          Next occurrence will be triggered on {ri.nextOccurrence ? moment(ri.nextOccurrence).format("LL") : "completion"}.
        </Text>
      </Box>
    </VStack>
  );
}
