import {
  Box,
  Button,
  Flex,
  IconButton,
  Link as ChakraLink,
  Show,
  Spinner,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { MdAutoAwesome } from "react-icons/md";
import { isAxiosError } from "axios";
import moment from "moment";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { invoiceStatusList } from "../../../constants/invoice";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import useDateFilterFetch from "../../../hooks/useDateFilterFetch";
import instance from "../../../instance";
import AlertModal from "../../common/AlertModal";
import MainLayout from "../../common/main-layout";
import Pagination from "../../common/main-layout/Pagination";
import TableLayout from "../../common/table-layout";
import VertIconMenu from "../../common/table-layout/VertIconMenu";
import BillModal from "../../estimates/list/BillModal";
import Status from "../../estimates/list/Status";
import RecordPaymentModal from "./RecordPaymentModal";
import TableDateFilter from "./TableDateFilter";
import GenerateInvoiceModal from "./GenerateInvoiceModal";
import useAsyncCall from "../../../hooks/useAsyncCall";
import ExporterModal from "../../common/ExporterModal";
import ShareBillModal from "../../common/ShareBillModal";
import useAuth from "../../../hooks/useAuth";

const getBillGrandTotal = (bill) =>
  Number(bill?.total || 0) +
  Number(bill?.totalTax || 0) +
  Number(bill?.shippingCharges || 0);

export default function InvoicesPage() {
  const { t, i18n } = useTranslation("invoice");
  const {
    items: invoices,
    reachedLimit,
    dateFilter,
    onChangeDateFilter,
    currentPage,
    totalPages,
    totalCount,
    fetchItems: fetchInvoices,
    status,
  } = useDateFilterFetch({
    entity: "invoices",
    storageKey: "dateFilter:invoices",
  });
  const auth = useAuth();
  const loading = status === "loading";
  const navigate = useNavigate();
  const { symbol } = useCurrentOrgCurrency();

  const invoiceTableMapper = (invoice) => ({
    partyName: (
      <ChakraLink
        to={`/${orgId}/parties/${invoice.party._id}/transactions`}
        as={Link}
      >
        {invoice.party.name}
      </ChakraLink>
    ),
    ...invoice,
    date: moment(invoice.date).format("LL"),
    grandTotal: `${symbol} ${getBillGrandTotal(invoice).toFixed(2)}`,
    status: <Status status={invoice.status} statusList={invoiceStatusList} />,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [invoice, setInvoice] = useState(null);
  const onOpenInvoice = (currentInvoice) => {
    setInvoice(currentInvoice);
    onOpen();
  };
  const { orgId } = useParams();
  const {
    isOpen: isDeleteModalOpen,
    onClose: onCloseDeleteModal,
    onOpen: onOpenDeleteModal,
  } = useDisclosure();
  const [invoiceStatus, setInvoiceStatus] = useState("idle");
  const toast = useToast();
  const deleteInvoice = async (invoice) => {
    try {
      if (!invoice) return;
      setInvoiceStatus("deleting");
      await instance.delete(
        `/api/v1/organizations/${orgId}/invoices/${invoice._id}`
      );
      onCloseDeleteModal();
      fetchInvoices();
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
      setInvoiceStatus("idle");
    }
  };
  const deleting = invoiceStatus === "deleting";
  const {
    isOpen: isGenerateModalOpen,
    onOpen: onOpenGenerateModal,
    onClose: onCloseGenerateModal,
  } = useDisclosure();

  const onClickAddNewInvoice = () => {
    navigate(`create`);
  };
  const { requestAsyncHandler } = useAsyncCall();
  const onSaveBill = requestAsyncHandler(async (item) => {
    const currentInvoice = item || invoice;
    const language = i18n.resolvedLanguage || i18n.language || "en";
    const downloadBill = `/api/v1/organizations/${
      currentInvoice.org._id
    }/invoices/${currentInvoice._id}/download?lng=${language}`;
    const { data } = await instance.get(downloadBill, {
      responseType: "blob",
    });
    const href = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.setAttribute("download", `Invoice-${currentInvoice.num}.pdf`);
    link.href = href;
    link.click();
    URL.revokeObjectURL(href);
  });
  const downloading = invoiceStatus === "downloading";
  const {
    isOpen: isRecordPaymentModalOpen,
    onOpen: openRecordPaymentModal,
    onClose: closeRecordPaymentModal,
  } = useDisclosure();
  const { isOpen: isExportModalOpen, onToggle: toggleExportModal } =
    useDisclosure();
  const { isOpen: isShareModalOpen, onToggle: toggleShareModal } =
    useDisclosure();

  return (
    <MainLayout>
      <Box p={4}>
        {loading ? (
          <Flex justifyContent={"center"} alignItems={"center"}>
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
            limitKey={"invoices"}
            showExport={{
              onExport: toggleExportModal,
              status: "idle",
            }}
            isAddDisabled={reachedLimit}
            heading={t("invoice_ui.page.heading")}
            extraActions={
              <Tooltip label="Generate invoice with AI">
                <span>
                  <Show above="md">
                    <Button
                      leftIcon={<MdAutoAwesome />}
                      size="sm"
                      colorScheme="purple"
                      onClick={onOpenGenerateModal}
                    >
                      Generate
                    </Button>
                  </Show>
                  <Show below="md">
                    <IconButton
                      icon={<MdAutoAwesome />}
                      size="sm"
                      colorScheme="purple"
                      onClick={onOpenGenerateModal}
                    />
                  </Show>
                </span>
              </Tooltip>
            }
            tableData={invoices.map(invoiceTableMapper)}
            caption={`${t("invoice_ui.page.total_found")} : ${totalCount}`}
            operations={invoices.map((invoice) => (
              <VertIconMenu
                recordPayment={() => {
                  setInvoice(invoice);
                  openRecordPaymentModal();
                }}
                shareItem={() => {
                  setInvoice(invoice);
                  toggleShareModal();
                }}
                openItem={() => {
                  navigate(`/${orgId}/receipt/invoices/${invoice._id}`);
                }}
                showItem={() => onOpenInvoice(invoice)}
                downloading={downloading}
                onDownloadItem={() => {
                  onSaveBill(invoice);
                }}
                editItem={() => {
                  navigate(`${invoice._id}/edit`);
                }}
                deleteItem={() => {
                  setInvoice(invoice);
                  onOpenDeleteModal();
                }}
              />
            ))}
            selectedKeys={{
              num: t("invoice_ui.table.columns.invoice_no"),
              date: t("invoice_ui.table.columns.invoice_date"),
              partyName: t("invoice_ui.table.columns.recipient"),
              status: t("invoice_ui.table.columns.status"),
              grandTotal: t("invoice_ui.table.columns.total"),
            }}
            onAddNewItem={onClickAddNewInvoice}
          />
        )}
        <GenerateInvoiceModal
          isOpen={isGenerateModalOpen}
          onClose={onCloseGenerateModal}
        />
        {invoice ? (
          <BillModal
            bill={invoice}
            entity={"invoices"}
            heading={t("invoice_ui.modal.heading")}
            isOpen={isOpen}
            onSaveBill={onSaveBill}
            onClose={onClose}
          />
        ) : null}
        {invoice ? (
          <ShareBillModal
            bill={invoice}
            isOpen={isShareModalOpen}
            onClose={toggleShareModal}
            billType={"invoices"}
          />
        ) : null}
        <AlertModal
          confirmDisable={deleting}
          body={t("invoice_ui.modal.delete_body")}
          header={t("invoice_ui.modal.delete_header")}
          isOpen={isDeleteModalOpen}
          onClose={onCloseDeleteModal}
          onConfirm={() => deleteInvoice(invoice)}
        />
        {invoice ? (
          <RecordPaymentModal
            invoice={invoice}
            fetchInvoices={fetchInvoices}
            isOpen={isRecordPaymentModalOpen}
            onClose={closeRecordPaymentModal}
          />
        ) : null}

        {loading ? null : (
          <Pagination currentPage={currentPage} total={totalPages} />
        )}
        {isExportModalOpen ? (
          <ExporterModal
            isOpen={isExportModalOpen}
            onClose={toggleExportModal}
            downloadUrl={`/api/v1/organizations/${orgId}/invoices/export?startDate=${dateFilter.startDate}&endDate=${dateFilter.endDate}`}
            defaultSelectedFields={{
              partyName: t("invoice_ui.export.default_fields.party_name"),
              billingAddress: t("invoice_ui.export.default_fields.billing_address"),
              total: t("invoice_ui.export.default_fields.total"),
              totalTax: t("invoice_ui.export.default_fields.total_tax"),
              date: t("invoice_ui.export.default_fields.date"),
              num: t("invoice_ui.export.default_fields.number"),
              status: t("invoice_ui.export.default_fields.status"),
              grandTotal: t("invoice_ui.export.default_fields.grand_total"),
            }}
            selectableFields={{
              createdByEmail: t("invoice_ui.export.selectable_fields.created_by_email"),
              createdByName: t("invoice_ui.export.selectable_fields.created_by_name"),
              poNo: t("invoice_ui.export.selectable_fields.po_number"),
              poDate: t("invoice_ui.export.selectable_fields.po_date"),
              cgst: t("invoice_ui.export.selectable_fields.cgst"),
              igst: t("invoice_ui.export.selectable_fields.igst"),
              sgst: t("invoice_ui.export.selectable_fields.sgst"),
              vat: t("invoice_ui.export.selectable_fields.vat"),
              cess: t("invoice_ui.export.selectable_fields.cess"),
              sal: t("invoice_ui.export.selectable_fields.sal"),
              others: t("invoice_ui.export.selectable_fields.other_taxes"),
            }}
          />
        ) : null}
      </Box>
    </MainLayout>
  );
}
