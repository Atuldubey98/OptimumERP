import { Box, Flex, Spinner, useDisclosure, useToast } from "@chakra-ui/react";
import { isAxiosError } from "axios";
import moment from "moment";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import useDateFilterFetch from "../../../hooks/useDateFilterFetch";
import useLimitsInFreePlan from "../../../hooks/useLimitsInFreePlan";
import useSaveBill from "../../../hooks/useSaveBill";
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
import ShareBillModal from "../../common/ShareBillModal";

export default function EstimatesPage() {
  const { t, i18n } = useTranslation("quote");
  const {  formatSmallestUnitWithSymbol } = useCurrentOrgCurrency();
  const { saveBill } = useSaveBill();

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
    extraParams: {
      select: "num date party status total totalTax org",
    },
  });
  const loading = status === "loading";
  const estimateTableMapper = (estimate) => ({
    partyName: estimate.party.name,
    ...estimate,
    date: moment(estimate.date).format("LL"),
    grandTotal: formatSmallestUnitWithSymbol(estimate.total + estimate.totalTax),
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
    await saveBill(currentEstimate, "quotes");
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
  const { isOpen: isShareModalOpen, onToggle: toggleShareModal } =
    useDisclosure();
  return (
    
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
            heading={t("quote_ui.page.heading")}
            tableData={estimates.map(estimateTableMapper)}
            caption={t("quote_ui.page.total_estimates_found", { count: totalCount })}
            operations={estimates.map((estimate) => (
              <VertIconMenu
                convertToInvoice={() => {
                  convertToInvoice(estimate);
                }}
                shareItem={() => {
                  setQuotation(estimate);
                  toggleShareModal();
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
                duplicateItem={() => {
                  navigate(`create`, { state: { duplicateId: estimate._id } });
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
        {quotation ? (
          <ShareBillModal
            bill={quotation}
            isOpen={isShareModalOpen}
            onClose={toggleShareModal}
            billType={"quotes"}
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
      </Box>
    
  );
}
