import React from "react";
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Stack,
  useColorModeValue,
  Link as ChakraLink
} from "@chakra-ui/react";
import { Link, useParams } from "react-router-dom";
import moment from "moment";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import useProperty from "../../hooks/useProperty";

export default function VoucherDetailDrawer({ isOpen, onClose, voucher }) {
  const { orgId } = useParams();
  const { formatSmallestUnitWithSymbol } = useCurrentOrgCurrency();
  const { value: paymentMethods = [] } = useProperty("PAYMENT_METHODS");
  const borderVal = useColorModeValue("gray.200", "gray.700");
  const sectionTitleColor = useColorModeValue("gray.500", "gray.400");
  const textValColor = useColorModeValue("gray.800", "white");
  const remarksBg = useColorModeValue("gray.50", "gray.800");

  if (!voucher) return null;

  const modeObj = paymentMethods.find((m) => m.value === voucher.paymentMode);
  const modeLabel = modeObj?.label || voucher.paymentMode || "-";
  const linkedDocPath = voucher.refDocModel === "invoice" ? "invoices" : "purchases";
  const hasRefDoc = voucher.refDoc && typeof voucher.refDoc === "object";

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent borderLeftWidth="1px" borderColor={borderVal}>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" fontWeight="bold">
          Payment Voucher Details
        </DrawerHeader>

        <DrawerBody>
          <VStack align="stretch" spacing={6} py={4}>
            {/* Header info */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <Badge fontSize="0.8em" colorScheme={voucher.voucherType === "receipt" ? "green" : "orange"} px={2} py={0.5} borderRadius="md">
                  {voucher.voucherType.toUpperCase()}
                </Badge>
                <Text fontSize="sm" color="gray.500" fontWeight="medium">
                  {moment(voucher.date).format("LL")}
                </Text>
              </HStack>
              <Text fontSize="lg" fontWeight="bold" color={textValColor} mb={1}>
                {voucher.num || "N/A"}
              </Text>
              <Text fontSize="xl" fontWeight="bold" color="blue.500">
                {formatSmallestUnitWithSymbol(voucher.amount)}
              </Text>
            </Box>

            <Divider />

            {/* General Properties */}
            <Stack spacing={4}>
              <Box>
                <Text fontSize="xs" fontWeight="bold" color={sectionTitleColor} textTransform="uppercase" letterSpacing="wider">
                  Party
                </Text>
                <Text fontSize="md" color={textValColor} mt={1} fontWeight="semibold">
                  {voucher.party ? (
                    <ChakraLink
                      as={Link}
                      to={`/${orgId}/parties/${voucher.party._id}/transactions`}
                      color="blue.500"
                      _hover={{ textDecoration: "underline" }}
                    >
                      {voucher.party.name}
                    </ChakraLink>
                  ) : (
                    "-"
                  )}
                </Text>
              </Box>

              <Box>
                <Text fontSize="xs" fontWeight="bold" color={sectionTitleColor} textTransform="uppercase" letterSpacing="wider">
                  Payment Mode
                </Text>
                <Text fontSize="md" color={textValColor} mt={1} fontWeight="medium">
                  {modeLabel}
                </Text>
              </Box>

              <Box>
                <Text fontSize="xs" fontWeight="bold" color={sectionTitleColor} textTransform="uppercase" letterSpacing="wider">
                  Linked Document
                </Text>
                <Box mt={1}>
                  {hasRefDoc ? (
                    <HStack spacing={2}>
                      <Badge variant="subtle" colorScheme="purple">
                        {voucher.refDocModel.toUpperCase()}
                      </Badge>
                      <ChakraLink
                        as={Link}
                        to={`/${orgId}/receipt/${linkedDocPath}/${voucher.refDoc._id}`}
                        color="blue.500"
                        fontWeight="medium"
                        _hover={{ textDecoration: "underline" }}
                      >
                        {voucher.refDoc.num || "View Document"}
                      </ChakraLink>
                    </HStack>
                  ) : (
                    <Text color="gray.400" fontSize="sm">-</Text>
                  )}
                </Box>
              </Box>
            </Stack>

            <Divider />

            {/* Description/Remarks */}
            <Box>
              <Text fontSize="xs" fontWeight="bold" color={sectionTitleColor} textTransform="uppercase" letterSpacing="wider" mb={2}>
                Description / Remarks
              </Text>
              <Box p={3} bg={remarksBg} borderRadius="md" border="1px" borderColor={borderVal}>
                <Text fontSize="sm" color={textValColor} whiteSpace="pre-wrap">
                  {voucher.description || "No remarks entered."}
                </Text>
              </Box>
            </Box>

            <Divider />

            {/* Technical metadata */}
            <Stack spacing={2} fontSize="xs" color="gray.400" mt="auto">
              {voucher.financialYear && (
                <HStack justify="space-between">
                  <Text>Financial Year:</Text>
                  <Text fontWeight="medium" color={textValColor}>
                    {moment(voucher.financialYear.start).format("YYYY")} - {moment(voucher.financialYear.end).format("YYYY")}
                  </Text>
                </HStack>
              )}
              {voucher.createdAt && (
                <HStack justify="space-between">
                  <Text>Created On:</Text>
                  <Text fontWeight="medium" color={textValColor}>
                    {moment(voucher.createdAt).format("LLL")}
                  </Text>
                </HStack>
              )}
            </Stack>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
