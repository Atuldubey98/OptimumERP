import {
  Box,
  Link as ChakraLink,
  Flex,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { isAxiosError } from "axios";
import moment from "moment";
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { invoiceStatusList } from "../../../constants/invoice";
import useDateFilterFetch from "../../../hooks/useDateFilterFetch";
import instance from "../../../instance";
import AlertModal from "../../common/AlertModal";
import MainLayout from "../../common/main-layout";
import Pagination from "../../common/main-layout/Pagination";
import TableLayout from "../../common/table-layout";
import VertIconMenu from "../../common/table-layout/VertIconMenu";
import BillModal from "../../estimates/list/BillModal";
import Status from "../../estimates/list/Status";
import TableDateFilter from "../../invoices/list/TableDateFilter";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import ExporterModal from "../../common/ExporterModal";

export default function PurchaseOrderPage() {
  const { orgId } = useParams();
  const {
    items: purchaseOrderItems,
    status,
    dateFilter,
    reachedLimit,
    onChangeDateFilter,
    fetchItems,
    totalCount,
    currentPage,
    totalPages,
  } = useDateFilterFetch({
    entity: "purchaseOrders",
  });
  const { symbol } = useCurrentOrgCurrency();
  const loading = status === "loading";
  const navigate = useNavigate();
  const toast = useToast();
  const {
    isOpen: isDeleteModalOpen,
    onClose: onCloseDeleteModal,
    onOpen: onOpenDeleteModal,
  } = useDisclosure();
  const [selectedPo, setSelectedPo] = useState(null);
  const [selectedPoStatus, setSelectedPoStatus] = useState("idle");
  const deletePurchaseOrder = async () => {
    try {
      if (!selectedPo) return;
      setSelectedPoStatus("deleting");
      const { data } = await instance.delete(
        `/api/v1/organizations/${orgId}/purchaseOrders/${selectedPo._id}`
      );
      toast({
        title: "Success",
        description: data.message,
        duration: 3000,
        isClosable: true,
        status: "success",
      });
      fetchItems();
      onCloseDeleteModal();
    } catch (error) {
      toast({
        title: isAxiosError(error) ? error.response.data.name : "Error",
        description: isAxiosError(error)
          ? error.response.data.message
          : "Some error occured",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSelectedPoStatus("idle");
    }
  };
  const deleting = selectedPoStatus === "deleting";
  const {
    isOpen: isBillModalOpen,
    onClose: closeBillModal,
    onOpen: openBillModal,
  } = useDisclosure();
  const onSaveBill = async (item) => {
    try {
      const currentInvoice = item || invoice;
      const downloadBill = `/api/v1/organizations/${
        currentInvoice.org._id
      }/purchaseOrders/${currentInvoice._id}/download?template=${
        localStorage.getItem("template") || "simple"
      }`;
      const { data } = await instance.get(downloadBill, {
        responseType: "blob",
      });
      const href = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.setAttribute("download", `Invoice-${currentInvoice.num}.pdf`);
      link.href = href;
      link.click();
      URL.revokeObjectURL(href);
    } catch (error) {
      const description = isAxiosError(error)
        ? error.response.data.message
        : "Some error occured";
      toast({
        title: isAxiosError(error) ? error.response.data.name : "Error",
        description,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  const { isOpen: isExportModalOpen, onToggle: toggleExportModal } =
  useDisclosure();
  return (
    <MainLayout>
      <Box p={4}>
        {loading ? (
          <PurchaseOrderLoader />
        ) : (
          <Box>
            <TableLayout
              isAddDisabled={reachedLimit}
              onAddNewItem={() => {
                navigate(`create`);
              }}
              filter={
                <TableDateFilter
                  dateFilter={dateFilter}
                  onChangeDateFilter={onChangeDateFilter}
                />
              }
              showExport={{
                onExport: toggleExportModal,
                status: "idle",
              }}
              operations={purchaseOrderItems.map((item) => (
                <VertIconMenu
                  key={item._id}
                  editItem={() => {
                    navigate(`${item._id}/edit`);
                  }}
                  deleteItem={() => {
                    setSelectedPo(item);
                    onOpenDeleteModal();
                  }}
                  showItem={() => {
                    setSelectedPo(item);
                    openBillModal();
                  }}
                  onDownloadItem={() => {
                    onSaveBill(item);
                  }}
                />
              ))}
              caption={`Total purchase orders : ${totalCount}`}
              selectedKeys={{
                num: "PO No",
                date: "PO Date",
                partyName: "Recipient",
                status: "Status",
                grandTotal: "Total",
              }}
              heading={"Purchase Orders"}
              tableData={purchaseOrderItems.map((item) => ({
                ...item,
                grandTotal: `${symbol} ${(item.total + item.totalTax).toFixed(
                  2
                )}`,
                date: moment(item.date).format("LL"),
                partyName: (
                  <ChakraLink
                    to={`/${orgId}/parties/${item.party._id}/transactions`}
                    as={Link}
                  >
                    {item.party.name}
                  </ChakraLink>
                ),
                status: (
                  <Status status={item.status} statusList={invoiceStatusList} />
                ),
              }))}
            />
            <Pagination currentPage={currentPage} total={totalPages} />
          </Box>
        )}
        <AlertModal
          confirmDisable={deleting}
          body={"Do you want to delete the purchase order ?"}
          header={"Delete PO"}
          isOpen={isDeleteModalOpen}
          onClose={onCloseDeleteModal}
          onConfirm={() => deletePurchaseOrder()}
        />
        {selectedPo ? (
          <BillModal
            isOpen={isBillModalOpen}
            onClose={closeBillModal}
            bill={selectedPo}
            entity={"purchaseOrders"}
            heading={"Purchase Order"}
          />
        ) : null}
        {isExportModalOpen ? (
          <ExporterModal
            isOpen={isExportModalOpen}
            onClose={toggleExportModal}
            downloadUrl={`/api/v1/organizations/${orgId}/purchaseOrders/export?startDate=${dateFilter.startDate}&endDate=${dateFilter.endDate}`}
            defaultSelectedFields={{
              partyName: "Party Name",
              billingAddress: "Billing Address",
              total: "Total",
              totalTax: "Total Tax",
              num: "Number",
              status: "Status",
              grandTotal: "Grand Total",
            }}
            selectableFields={{
              createdByEmail: "Created By Email",
              createdByName: "Created By Name",
              cgst: "CGST",
              igst: "IGST",
              sgst: "SGST",
              vat: "VAT",
              cess: "Cess",
              sal: "SAL",
              others: "Other taxes",
            }}
          />
        ) : null}
      </Box>
    </MainLayout>
  );

  function PurchaseOrderLoader() {
    return (
      <Flex justifyContent={"center"} alignItems={"center"}>
        <Spinner />
      </Flex>
    );
  }
}
