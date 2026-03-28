import {
  Box,
  Flex,
  Spinner,
  useDisclosure,
  useToast,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { isAxiosError } from "axios";
import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import useDateFilterFetch from "../../../hooks/useDateFilterFetch";
import instance from "../../../instance";
import AlertModal from "../../common/AlertModal";
import MainLayout from "../../common/main-layout";
import Pagination from "../../common/main-layout/Pagination";
import TableLayout from "../../common/table-layout";
import VertIconMenu from "../../common/table-layout/VertIconMenu";
import BillModal from "../../estimates/list/BillModal";
import TableDateFilter from "../../invoices/list/TableDateFilter";
import Status from "../../estimates/list/Status";
import { invoiceStatusList } from "../../../constants/invoice";
import useLimitsInFreePlan from "../../../hooks/useLimitsInFreePlan";
import moment from "moment";
import ExporterModal from "../../common/ExporterModal";
import { useTranslation } from "react-i18next";
export default function ProformaInvoicesPage() {
  const { t, i18n } = useTranslation("proformaInvoice");
  const {
    items,
    dateFilter,
    onChangeDateFilter,
    currentPage,
    totalPages,
    totalCount,
    reachedLimit,
    fetchItems: fetchFn,
    status,
  } = useDateFilterFetch({
    entity: "proformaInvoices",
  });
  const loading = status === "loading";
  const navigate = useNavigate();
  const { symbol } = useCurrentOrgCurrency();
  const { orgId } = useParams();
  const {
    isOpen: isAlertModalOpen,
    onOpen: openAlertModal,
    onClose: closeAlertModal,
  } = useDisclosure();
  const {
    isOpen: IsBillModalOpen,
    onOpen: openBillModal,
    onClose: closeBillModal,
  } = useDisclosure();
  const toast = useToast();
  const [proformaInvoiceSelected, setProformaInvoiceSelected] = useState(null);
  const [proformaInvoiceStatus, setProformaInvoiceStatus] = useState("idle");
  const deleteProformaInvoice = async () => {
    try {
      if (!proformaInvoiceSelected) return;
      setProformaInvoiceStatus("deleting");
      await instance.delete(
        `/api/v1/organizations/${orgId}/proformaInvoices/${proformaInvoiceSelected._id}`
      );
      closeAlertModal();
      fetchFn();
      setProformaInvoiceStatus("idle");
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
      setProformaInvoiceStatus("idle");
    }
  };

  const onSaveBill = async (item) => {
    const currentInvoice = item || invoice;
    const language = i18n.resolvedLanguage || i18n.language || "en";
    const downloadBill = `/api/v1/organizations/${
      currentInvoice.org._id
    }/proformaInvoices/${currentInvoice._id}/download?template=${
      localStorage.getItem("template") || "simple"
    }&lng=${language}`;
    const { data } = await instance.get(downloadBill, {
      responseType: "blob",
    });
    const href = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.setAttribute("download", `ProformaInvoice-${currentInvoice.num}.pdf`);
    link.href = href;
    link.click();
    URL.revokeObjectURL(href);
  };
  const {
    isOpen: isConvertToInvoiceModalOpen,
    onOpen: openConvertToInvoiceConfirmationModal,
    onClose: closeConvertToInvoiceConfirmationModal,
  } = useDisclosure();
  const onOpenConvertToInvoiceConfirmationModal = (item) => {
    setProformaInvoiceSelected(item);
    openConvertToInvoiceConfirmationModal();
  };
  const onCloseConvertToInvoiceConfirmationModal = () => {
    setProformaInvoiceSelected(null);
    closeConvertToInvoiceConfirmationModal();
  };
  const convertToInvoice = async () => {
    try {
      setProformaInvoiceStatus("converting");
      const { data } = await instance.post(
        `/api/v1/organizations/${orgId}/proformaInvoices/${proformaInvoiceSelected._id}/convertToInvoice`
      );
      toast({
        title: t("proforma_invoice_ui.toast.success_title"),
        description: data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onCloseConvertToInvoiceConfirmationModal();
    } catch (error) {
      toast({
        title: isAxiosError(error) ? error.response.data.name : t("proforma_invoice_ui.toast.error_title"),
        description: isAxiosError(error)
          ? error.response.data.message
          : t("proforma_invoice_ui.toast.error_fallback"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setProformaInvoiceStatus("idle");
    }
  };
  const { isOpen: isExportModalOpen, onToggle: toggleExportModal } =
    useDisclosure();
  const makeProformaListMapper = (item) => ({
    ...item,
    date: moment(item.date).format("LL"),
    recipient: (
      <ChakraLink
        to={`/${orgId}/parties/${item.party._id}/transactions`}
        as={Link}
      >
        {item.party.name}
      </ChakraLink>
    ),
    status: <Status status={item.status} statusList={invoiceStatusList} />,
    grandTotal: `${symbol} ${(item.totalTax + item.total).toFixed(2)}`,
  });
  return (
    <MainLayout>
      <Box p={4}>
        {loading ? (
          <Flex justifyContent={"center"} alignItems={"center"}>
            <Spinner />
          </Flex>
        ) : (
          <TableLayout
            showExport={{
              status: "idle",
              onExport: toggleExportModal,
            }}
            isAddDisabled={reachedLimit}
            limitKey={"proformaInvoices"}
            caption={`${t("proforma_invoice_ui.page.total_found")} : ${totalCount}`}
            heading={t("proforma_invoice_ui.page.heading")}
            operations={items.map((item) => (
              <VertIconMenu
                key={item._id}
                convertToInvoice={() => {
                  onOpenConvertToInvoiceConfirmationModal(item);
                }}
                onDownloadItem={() => onSaveBill(item)}
                showItem={() => {
                  setProformaInvoiceSelected(item);
                  openBillModal();
                }}
                deleteItem={() => {
                  setProformaInvoiceSelected(item);
                  openAlertModal();
                }}
                openItem={() => {
                  navigate(`/${orgId}/receipt/proformaInvoices/${item._id}`);
                }}
                editItem={() => navigate(`${item._id}/edit`)}
              />
            ))}
            tableData={items.map(makeProformaListMapper)}
            onAddNewItem={() => navigate(`create`)}
            filter={
              <TableDateFilter
                dateFilter={dateFilter}
                onChangeDateFilter={onChangeDateFilter}
              />
            }
            selectedKeys={{
              num: t("proforma_invoice_ui.table.columns.num"),
              date: t("proforma_invoice_ui.table.columns.date"),
              recipient: t("proforma_invoice_ui.table.columns.recipient"),
              status: t("proforma_invoice_ui.table.columns.status"),
              grandTotal: t("proforma_invoice_ui.table.columns.grand_total"),
            }}
          />
        )}
        {loading ? null : (
          <Pagination currentPage={currentPage} total={totalPages} />
        )}
      </Box>
      <AlertModal
        confirmDisable={proformaInvoiceStatus === "deleting"}
        body={t("proforma_invoice_ui.modal.delete_body")}
        header={t("proforma_invoice_ui.modal.delete_header")}
        isOpen={isAlertModalOpen}
        onClose={closeAlertModal}
        onConfirm={deleteProformaInvoice}
      />
      <AlertModal
        buttonLabel={t("proforma_invoice_ui.modal.convert_button")}
        confirmDisable={proformaInvoiceStatus === "converting"}
        body={t("proforma_invoice_ui.modal.convert_body")}
        header={t("proforma_invoice_ui.modal.convert_header")}
        isOpen={isConvertToInvoiceModalOpen}
        onClose={closeConvertToInvoiceConfirmationModal}
        onConfirm={convertToInvoice}
      />
      {proformaInvoiceSelected ? (
        <BillModal
          bill={proformaInvoiceSelected}
          entity={"proformaInvoices"}
          heading={t("proforma_invoice_ui.bill_modal.heading")}
          isOpen={IsBillModalOpen}
          onClose={closeBillModal}
        />
      ) : null}
      {isExportModalOpen ? (
        <ExporterModal
          isOpen={isExportModalOpen}
          onClose={toggleExportModal}
          downloadUrl={`/api/v1/organizations/${orgId}/proformaInvoices/export?startDate=${dateFilter.startDate}&endDate=${dateFilter.endDate}`}
          defaultSelectedFields={{
            partyName: t("proforma_invoice_ui.export.default_fields.party_name"),
            billingAddress: t("proforma_invoice_ui.export.default_fields.billing_address"),
            total: t("proforma_invoice_ui.export.default_fields.total"),
            totalTax: t("proforma_invoice_ui.export.default_fields.total_tax"),
            num: t("proforma_invoice_ui.export.default_fields.num"),
            status: t("proforma_invoice_ui.export.default_fields.status"),
          }}
          selectableFields={{
            createdByEmail: t("proforma_invoice_ui.export.selectable_fields.created_by_email"),
            createdByName: t("proforma_invoice_ui.export.selectable_fields.created_by_name"),
            poNo: t("proforma_invoice_ui.export.selectable_fields.po_no"),
            poDate: t("proforma_invoice_ui.export.selectable_fields.po_date"),
            cgst: t("proforma_invoice_ui.export.selectable_fields.cgst"),
            igst: t("proforma_invoice_ui.export.selectable_fields.igst"),
            sgst: t("proforma_invoice_ui.export.selectable_fields.sgst"),
            vat: t("proforma_invoice_ui.export.selectable_fields.vat"),
            cess: t("proforma_invoice_ui.export.selectable_fields.cess"),
            sal: t("proforma_invoice_ui.export.selectable_fields.sal"),
            others: t("proforma_invoice_ui.export.selectable_fields.others"),
          }}
        />
      ) : null}
    </MainLayout>
  );
}
