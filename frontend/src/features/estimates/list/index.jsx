import { Box, Flex, Spinner, useDisclosure, useToast } from "@chakra-ui/react";
import { isAxiosError } from "axios";
import moment from "moment";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import useDateFilterFetch from "../../../hooks/useDateFilterFetch";
import useLimitsInFreePlan from "../../../hooks/useLimitsInFreePlan";
import instance from "../../../instance";
import AlertModal from "../../common/AlertModal";
import MainLayout from "../../common/main-layout";
import Pagination from "../../common/main-layout/Pagination";
import TableLayout from "../../common/table-layout";
import VertIconMenu from "../../common/table-layout/VertIconMenu";
import { statusList } from "../create/data";
import BillFilter from "./BillFilter";
import BillModal from "./BillModal";
import Status from "./Status";
import TableDateFilter from "../../invoices/list/TableDateFilter";
import ExporterModal from "../../common/ExporterModal";

export default function EstimatesPage() {
  const { t, i18n } = useTranslation("quote");
  const {  getAmountWithSymbol } = useCurrentOrgCurrency();

  const navigate = useNavigate();
  const onClickAddNewQuote = useCallback(() => {
    navigate(`create`);
  }, []);
  const {
    items: estimates,
    onChangeDateFilter,
    dateFilter,
    status,
    reachedLimit,
    currentPage,
    totalPages,
    fetchItems: fetchQuotes,
    totalCount,
  } = useDateFilterFetch({
    entity: "quotes",
    storageKey: "dateFilter:quotes",
  });
  const loading = status === "loading";
  const estimateTableMapper = (estimate) => ({
    partyName: estimate.party.name,
    ...estimate,
    date: moment(estimate.date).format("LL"),
    grandTotal: getAmountWithSymbol(estimate.total + estimate.totalTax),
    status: <Status status={estimate.status} statusList={statusList} />,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [quotation, setQuotation] = useState(null);
  const onOpenQuotation = (estimate) => {
    setQuotation(estimate);
    onOpen();
  };
  const { orgId } = useParams();
  const {
    isOpen: isDeleteModalOpen,
    onClose: onCloseDeleteModal,
    onOpen: onOpenDeleteModal,
  } = useDisclosure();
  const [estimateStatus, setEstimateStatus] = useState("idle");
  const deleteQuote = async (estimate) => {
    try {
      if (!estimate) return;
      setEstimateStatus("deleting");
      await instance.delete(
        `/api/v1/organizations/${orgId}/quotes/${estimate._id}`,
      );
      onCloseDeleteModal();
      fetchQuotes();
      setEstimateStatus("idle");
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
      setEstimateStatus("idle");
    }
  };
  const onSaveBill = async (item) => {
    const currentEstimate = quotation || item;
    const language = i18n.resolvedLanguage || i18n.language || "en";
    const downloadBill = `/api/v1/organizations/${
      currentEstimate.org._id
    }/quotes/${currentEstimate._id}/download?lng=${language}`;
    const { data } = await instance.get(downloadBill, {
      responseType: "blob",
    });
    const href = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.setAttribute("download", `Quotation-${currentEstimate.num}.pdf`);
    link.href = href;
    link.click();
    URL.revokeObjectURL(href);
  };
  const toast = useToast();
  const convertToInvoice = async (quote) => {
    try {
      const { data } = await instance.post(
        `/api/v1/organizations/${orgId}/quotes/${quote._id}/convertToInvoice`,
      );
      toast({
        title: t("quote_ui.toasts.success"),
        description: data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
    }
  };
  const deleting = estimateStatus === "deleting";
  const { isOpen: isExportModalOpen, onToggle: toggleExportModal } =
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
            isAddDisabled={reachedLimit}
            filter={
              <TableDateFilter
                dateFilter={dateFilter}
                onChangeDateFilter={onChangeDateFilter}
              />
            }
            limitKey={"quotes"}
            showExport={{
              onExport: toggleExportModal,
              status: "idle",
            }}
            heading={t("quote_ui.page.heading")}
            tableData={estimates.map(estimateTableMapper)}
            caption={t("quote_ui.page.total_estimates_found", { count: totalCount })}
            operations={estimates.map((estimate) => (
              <VertIconMenu
                convertToInvoice={() => {
                  convertToInvoice(estimate);
                }}
                openItem={() => {
                  navigate(`/${orgId}/receipt/quotes/${estimate._id}`);
                }}
                onDownloadItem={() => {
                  onSaveBill(estimate);
                }}
                showItem={() => onOpenQuotation(estimate)}
                editItem={() => {
                  navigate(`${estimate._id}/edit`);
                }}
                deleteItem={() => {
                  setQuotation(estimate);
                  onOpenDeleteModal();
                }}
              />
            ))}
            selectedKeys={{
              num: t("quote_ui.table.columns.quote_no"),
              date: t("quote_ui.table.columns.quotation_date"),
              partyName: t("quote_ui.table.columns.party_name"),
              status: t("quote_ui.table.columns.status"),
              grandTotal: t("quote_ui.table.columns.total"),
            }}
            onAddNewItem={onClickAddNewQuote}
          />
        )}
        {quotation ? (
          <BillModal
            onSaveBill={onSaveBill}
            isOpen={isOpen}
            onClose={onClose}
            bill={quotation}
            entity={"quotes"}
            heading={"Quotation"}
          />
        ) : null}
        <AlertModal
          confirmDisable={deleting}
          body={t("quote_ui.page.delete_estimate")}
          header={t("quote_ui.page.delete_quotation")}
          isOpen={isDeleteModalOpen}
          onClose={onCloseDeleteModal}
          onConfirm={() => deleteQuote(quotation)}
        />
        {loading ? null : (
          <Pagination total={totalPages} currentPage={currentPage} />
        )}
        {isExportModalOpen ? (
          <ExporterModal
            isOpen={isExportModalOpen}
            onClose={toggleExportModal}
            downloadUrl={`/api/v1/organizations/${orgId}/quotes/export?startDate=${dateFilter.startDate}&endDate=${dateFilter.endDate}`}
            defaultSelectedFields={{
              partyName: t("quote_ui.export.default_fields.party_name"),
              billingAddress: t("quote_ui.export.default_fields.billing_address"),
              total: t("quote_ui.export.default_fields.total"),
              totalTax: t("quote_ui.export.default_fields.total_tax"),
              num: t("quote_ui.export.default_fields.num"),
              status: t("quote_ui.export.default_fields.status"),
              grandTotal: t("quote_ui.export.default_fields.grand_total"),
            }}
            selectableFields={{
              createdByEmail: t("quote_ui.export.optional_fields.created_by_email"),
              createdByName: t("quote_ui.export.optional_fields.created_by_name"),
              poNo: t("quote_ui.export.optional_fields.po_no"),
              poDate: t("quote_ui.export.optional_fields.po_date"),
              cgst: t("quote_ui.export.optional_fields.cgst"),
              igst: t("quote_ui.export.optional_fields.igst"),
              sgst: t("quote_ui.export.optional_fields.sgst"),
              vat: t("quote_ui.export.optional_fields.vat"),
              cess: t("quote_ui.export.optional_fields.cess"),
              sal: t("quote_ui.export.optional_fields.sal"),
              others: t("quote_ui.export.optional_fields.others"),
            }}
          />
        ) : null}
      </Box>
    </MainLayout>
  );
}
