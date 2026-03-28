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
import { useTranslation } from "react-i18next";

export default function PurchaseOrderPage() {
  const { t, i18n } = useTranslation("purchaseOrder");
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
        title: t("purchase_order_ui.toast.success_title"),
        description: data.message,
        duration: 3000,
        isClosable: true,
        status: "success",
      });
      fetchItems();
      onCloseDeleteModal();
    } catch (error) {
      toast({
        title: isAxiosError(error)
          ? error.response.data.name
          : t("purchase_order_ui.toast.error_title"),
        description: isAxiosError(error)
          ? error.response.data.message
          : t("purchase_order_ui.toast.error_fallback"),
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
      const language = i18n.resolvedLanguage || i18n.language || "en";
      const downloadBill = `/api/v1/organizations/${
        currentInvoice.org._id
      }/purchaseOrders/${currentInvoice._id}/download?template=${
        localStorage.getItem("template") || "simple"
      }&lng=${language}`;
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
        : t("purchase_order_ui.toast.error_fallback");
      toast({
        title: isAxiosError(error)
          ? error.response.data.name
          : t("purchase_order_ui.toast.error_title"),
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
                  openItem={() => {
                    navigate(`/${orgId}/receipt/purchaseOrders/${item._id}`);
                  }}
                  onDownloadItem={() => {
                    onSaveBill(item);
                  }}
                />
              ))}
              caption={`${t("purchase_order_ui.page.total_found")} : ${totalCount}`}
              selectedKeys={{
                num: t("purchase_order_ui.table.columns.po_no"),
                date: t("purchase_order_ui.table.columns.po_date"),
                partyName: t("purchase_order_ui.table.columns.recipient"),
                status: t("purchase_order_ui.table.columns.status"),
                grandTotal: t("purchase_order_ui.table.columns.total"),
              }}
              heading={t("purchase_order_ui.page.heading")}
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
          body={t("purchase_order_ui.modal.delete_body")}
          header={t("purchase_order_ui.modal.delete_header")}
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
            heading={t("purchase_order_ui.bill_modal.heading")}
          />
        ) : null}
        {isExportModalOpen ? (
          <ExporterModal
            isOpen={isExportModalOpen}
            onClose={toggleExportModal}
            downloadUrl={`/api/v1/organizations/${orgId}/purchaseOrders/export?startDate=${dateFilter.startDate}&endDate=${dateFilter.endDate}`}
            defaultSelectedFields={{
              partyName: t("purchase_order_ui.export.default_fields.party_name"),
              billingAddress: t("purchase_order_ui.export.default_fields.billing_address"),
              total: t("purchase_order_ui.export.default_fields.total"),
              totalTax: t("purchase_order_ui.export.default_fields.total_tax"),
              num: t("purchase_order_ui.export.default_fields.num"),
              status: t("purchase_order_ui.export.default_fields.status"),
              grandTotal: t("purchase_order_ui.export.default_fields.grand_total"),
            }}
            selectableFields={{
              createdByEmail: t("purchase_order_ui.export.selectable_fields.created_by_email"),
              createdByName: t("purchase_order_ui.export.selectable_fields.created_by_name"),
              cgst: t("purchase_order_ui.export.selectable_fields.cgst"),
              igst: t("purchase_order_ui.export.selectable_fields.igst"),
              sgst: t("purchase_order_ui.export.selectable_fields.sgst"),
              vat: t("purchase_order_ui.export.selectable_fields.vat"),
              cess: t("purchase_order_ui.export.selectable_fields.cess"),
              sal: t("purchase_order_ui.export.selectable_fields.sal"),
              others: t("purchase_order_ui.export.selectable_fields.others"),
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
