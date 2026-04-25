import {
  Box,
  Link as ChakraLink,
  Flex,
  Spinner,
  useDisclosure,
  useToast,
  Badge,
  Text,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import moment from "moment";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
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
    extraParams,
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
          <TableLayout
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
        )}

        <VoucherModal
          isOpen={isVoucherModalOpen}
          onClose={onCloseVoucherModal}
          voucher={selectedVoucher}
          fetchVouchers={fetchVouchers}
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
