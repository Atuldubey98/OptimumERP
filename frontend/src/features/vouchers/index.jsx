import {
  Box,
  Flex,
  Spinner,
  useDisclosure,
  useToast,
  Badge,
  Text,
  Stack,
  Card,
  CardHeader,
  CardBody,
  HStack,
  VStack,
  Icon,
  SimpleGrid,
  Divider,
  Link as ChakraLink
} from "@chakra-ui/react";

import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import moment from "moment";
import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { FiFileText, FiCalendar, FiDollarSign, FiArrowUpCircle, FiArrowDownCircle } from "react-icons/fi";


import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import useDateFilterFetch from "../../hooks/useDateFilterFetch";
import instance from "../../instance";
import AlertModal from "../common/AlertModal";
import MainLayout from "../common/main-layout";
import Pagination from "../common/main-layout/Pagination";
import TableLayout from "../common/table-layout";
import VertIconMenu from "../common/table-layout/VertIconMenu";
import TableDateFilter from "../invoices/list/TableDateFilter";
import VoucherModal from "./VoucherModal";
import useProperty from "../../hooks/useProperty";

export default function VouchersPage() {
  const { t } = useTranslation("invoice");
  const { orgId, invoiceId, purchaseId } = useParams();
  const location = useLocation();

  const [doc, setDoc] = useState(location.state?.data);
  const docType = location.state?.type || (invoiceId ? "invoice" : purchaseId ? "purchase" : null);

  const fetchDoc = async () => {
    if (!invoiceId && !purchaseId) return;
    const path = invoiceId ? `invoices/${invoiceId}` : `purchases/${purchaseId}`;
    try {
      const { data } = await instance.get(`/api/v1/organizations/${orgId}/${path}`);
      setDoc(data.data);
    } catch (error) {
      console.error("Failed to fetch document", error);
    }
  };

  const grandTotal = doc ? (Number(doc.total || 0) + Number(doc.totalTax || 0) + Number(doc.shippingCharges || 0)) : 0;
  const balance = doc ? (grandTotal - Number(doc.paymentVoucherBalance || 0)) : 0;

  const { value: paymentMethods = [] } = useProperty("PAYMENT_METHODS");
  const extraParams = {};
  if (invoiceId) {
    extraParams.refDoc = invoiceId;
    extraParams.refDocModel = "invoice";
  } else if (purchaseId) {
    extraParams.refDoc = purchaseId;
    extraParams.refDocModel = "purchase";
  }

  const {
    items: vouchers,
    reachedLimit,
    dateFilter,
    onChangeDateFilter,
    currentPage,
    totalPages,
    totalCount,
    fetchItems: fetchVouchers,
    status,
  } = useDateFilterFetch({
    entity: "paymentVouchers",
    storageKey: "dateFilter:vouchers",
    extraParams: {
      ...extraParams,
      select: "num date party voucherType refDoc refDocModel amount paymentMode org",
    },
  });
  
  const loading = status === "loading";
  const { formatSmallestUnitWithSymbol } = useCurrentOrgCurrency();
  const toast = useToast();

  const [selectedVoucher, setSelectedVoucher] = useState(null);
  
  const {
    isOpen: isDeleteModalOpen,
    onClose: onCloseDeleteModal,
    onOpen: onOpenDeleteModal,
  } = useDisclosure();
  
  const {
    isOpen: isVoucherModalOpen,
    onOpen: onOpenVoucherModal,
    onClose: onCloseVoucherModal,
  } = useDisclosure();

  const [deleteStatus, setDeleteStatus] = useState("idle");

  const deleteVoucher = async (voucher) => {
    try {
      if (!voucher) return;
      setDeleteStatus("deleting");
      await instance.delete(
        `/api/v1/organizations/${orgId}/paymentVouchers/${voucher._id}`,
      );
      toast({
        title: "Success",
        description: "Payment voucher deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onCloseDeleteModal();
      fetchVouchers();
      fetchDoc();
    } catch (error) {
      toast({
        title: isAxiosError(error) ? error.response.data.name : "Error",
        description: isAxiosError(error)
          ? error.response.data.message
          : "Some error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeleteStatus("idle");
    }
  };

  const handleEdit = (voucher) => {
    setSelectedVoucher(voucher);
    onOpenVoucherModal();
  };

  const handleAdd = () => {
    setSelectedVoucher(null);
    onOpenVoucherModal();
  };

  useEffect(() => {
    fetchDoc();
  }, [invoiceId, purchaseId]);

  const onVoucherSaved = () => {
    fetchVouchers();
    fetchDoc();
  };

  const voucherTableMapper = (voucher) => {
    const modeObj = paymentMethods.find((m) => m.value === voucher.paymentMode);
    const linkedDocPath = voucher.refDocModel === "invoice" ? "invoices" : "purchases";
    const hasRefDoc = voucher.refDoc && typeof voucher.refDoc === "object";
    
    return {
      ...voucher,
      num: voucher.num || "-",
      date: moment(voucher.date).format("LL"),
      partyName: voucher.party ? (
        <ChakraLink
          to={`/${orgId}/parties/${voucher.party._id}/transactions`}
          as={Link}
        >
          {voucher.party.name}
        </ChakraLink>
      ) : "-",
      type: (
        <Badge colorScheme={voucher.voucherType === "receipt" ? "green" : "orange"}>
          {voucher.voucherType.toUpperCase()}
        </Badge>
      ),
      linkedDoc: hasRefDoc ? (
        <ChakraLink
          as={Link}
          to={`/${orgId}/receipt/${linkedDocPath}/${voucher.refDoc._id}`}
          color="blue.500"
          fontWeight="medium"
        >
          {voucher.refDoc.num || "View"}
        </ChakraLink>
      ) : (
        <Text color="gray.400">-</Text>
      ),
      amount: formatSmallestUnitWithSymbol(voucher.amount),
      mode: modeObj?.label || voucher.paymentMode || "-",
    };
  };

  return (
 
      <Box p={4}>
        {loading ? (
          <Flex justifyContent={"center"} alignItems={"center"} minH="200px">
            <Spinner size={"md"} />
          </Flex>
        ) : (
          <Stack spacing={6}>
            {doc && (
              <Card variant="outline" shadow="sm">
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 3, lg: 5 }} spacing={6}>
                    <HStack>
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

                    <HStack>
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

                    <HStack>
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

                    <HStack>
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

                    <HStack>
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
                  </SimpleGrid>
                </CardBody>
              </Card>
            )}

            <TableLayout
              isAddDisabled={reachedLimit}
              filter={
              <TableDateFilter
                dateFilter={dateFilter}
                onChangeDateFilter={onChangeDateFilter}
              />
            }
            heading="Payment Vouchers"
            tableData={vouchers.map(voucherTableMapper)}
            caption={`Total vouchers found : ${totalCount}`}
            operations={vouchers.map((voucher) => (
              <VertIconMenu
                editItem={() => handleEdit(voucher)}
                deleteItem={() => {
                  setSelectedVoucher(voucher);
                  onOpenDeleteModal();
                }}
              />
            ))}
            selectedKeys={{
              num: "Voucher No",
              date: "Date",
              partyName: "Party",
              type: "Type",
              linkedDoc: "Linked Doc",
              amount: "Amount",
              mode: "Mode",
            }}
            onAddNewItem={handleAdd}
          />
        </Stack>
      )}


        <VoucherModal
          isOpen={isVoucherModalOpen}
          onClose={onCloseVoucherModal}
          voucher={selectedVoucher}
          onVoucherSaved={onVoucherSaved}
          refDocId={invoiceId || purchaseId}
          refDocModel={invoiceId ? "invoice" : purchaseId ? "purchase" : null}
          doc={doc}
        />

        <AlertModal
          confirmDisable={deleteStatus === "deleting"}
          body="Are you sure you want to delete this payment voucher? This will update the linked invoice/purchase status and balance."
          header="Delete Payment Voucher"
          isOpen={isDeleteModalOpen}
          onClose={onCloseDeleteModal}
          onConfirm={() => deleteVoucher(selectedVoucher)}
        />

        {loading ? null : (
          <Pagination currentPage={currentPage} total={totalPages} />
        )}
      </Box>
    
  );
}
