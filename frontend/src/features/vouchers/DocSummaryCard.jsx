import React from "react";
import {
  Flex,
  Card,
  CardBody,
  HStack,
  VStack,
  Icon,
  Text
} from "@chakra-ui/react";
import moment from "moment";
import {
  FiFileText,
  FiCalendar,
  FiDollarSign,
  FiArrowUpCircle,
  FiArrowDownCircle
} from "react-icons/fi";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";

export default function DocSummaryCard({ doc, docType, grandTotal, balance }) {
  const { formatSmallestUnitWithSymbol } = useCurrentOrgCurrency();

  if (!doc) return null;

  return (
    <Card variant="outline" shadow="sm">
      <CardBody>
        <Flex
          wrap="wrap"
          gap={{ base: 4, md: 6 }}
          justifyContent="space-between"
          alignItems="center"
        >
          <HStack flex={{ base: "1 1 140px", md: "1" }} minW="140px">
            <Icon as={FiFileText} color="blue.500" boxSize={5} />
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color="gray.500" fontWeight="bold">
                {docType?.toUpperCase()} #
              </Text>
              <Text fontSize="md" fontWeight="bold">
                {doc.num}
              </Text>
            </VStack>
          </HStack>

          <HStack flex={{ base: "1 1 140px", md: "1" }} minW="140px">
            <Icon as={FiCalendar} color="orange.500" boxSize={5} />
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color="gray.500" fontWeight="bold">
                DATE
              </Text>
              <Text fontSize="md">
                {moment(doc.date).format("LL")}
              </Text>
            </VStack>
          </HStack>

          <HStack flex={{ base: "1 1 140px", md: "1" }} minW="140px">
            <Icon as={FiDollarSign} color="green.500" boxSize={5} />
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color="gray.500" fontWeight="bold">
                TOTAL AMOUNT
              </Text>
              <Text fontSize="md" fontWeight="bold">
                {formatSmallestUnitWithSymbol(grandTotal)}
              </Text>
            </VStack>
          </HStack>

          <HStack flex={{ base: "1 1 140px", md: "1" }} minW="140px">
            <Icon as={FiArrowDownCircle} color="purple.500" boxSize={5} />
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color="gray.500" fontWeight="bold">
                {docType === "invoice" ? "AMOUNT RECEIVED" : "AMOUNT PAID"}
              </Text>
              <Text fontSize="md" fontWeight="bold" color="purple.600">
                {formatSmallestUnitWithSymbol(doc.paymentVoucherBalance || 0)}
              </Text>
            </VStack>
          </HStack>

          <HStack flex={{ base: "1 1 140px", md: "1" }} minW="140px">
            <Icon
              as={balance <= 0 ? (docType === "invoice" ? FiArrowUpCircle : FiArrowDownCircle) : FiDollarSign}
              color={balance <= 0 ? "green.500" : "red.500"}
              boxSize={5}
            />
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color="gray.500" fontWeight="bold">
                {balance === 0 ? "STATUS" : (balance < 0 ? (docType === "invoice" ? "EXTRA RECEIVED" : "EXTRA PAID") : "BALANCE DUE")}
              </Text>
              <Text fontSize="md" fontWeight="bold" color={balance <= 0 ? "green.600" : "red.600"}>
                {balance === 0 ? "SETTLED" : formatSmallestUnitWithSymbol(Math.abs(balance))}
              </Text>
            </VStack>
          </HStack>
        </Flex>
      </CardBody>
    </Card>
  );
}
