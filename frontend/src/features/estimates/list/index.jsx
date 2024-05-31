import { Box, Flex, Spinner, useDisclosure, useToast } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAsyncCall from "../../../hooks/useAsyncCall";
import useDateFilterFetch from "../../../hooks/useDateFilterFetch";
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
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import { isAxiosError } from "axios";
import useLimitsInFreePlan from "../../../hooks/useLimitsInFreePlan";

export default function EstimatesPage() {
  const { symbol } = useCurrentOrgCurrency();

  const navigate = useNavigate();
  const onClickAddNewQuote = useCallback(() => {
    navigate(`create`);
  }, []);
  const {
    items: estimates,
    onChangeDateFilter,
    dateFilter,
    status,
    currentPage,
    totalPages,
    fetchItems: fetchQuotes,
    totalCount,
  } = useDateFilterFetch({
    entity: "quotes",
  });
  const loading = status === "loading";
  const estimateTableMapper = (estimate) => ({
    partyName: estimate.party.name,
    ...estimate,
    date: new Date(estimate.date).toLocaleDateString(),
    grandTotal: `${symbol} ${(estimate.total + estimate.totalTax).toFixed(2)}`,
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
        `/api/v1/organizations/${orgId}/quotes/${estimate._id}`
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
    const downloadBill = `/api/v1/organizations/${
      currentEstimate.org._id
    }/quotes/${currentEstimate._id}/download?template=${
      localStorage.getItem("template") || "simple"
    }`;
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
        `/api/v1/organizations/${orgId}/quotes/${quote._id}/convertToInvoice`
      );
      toast({
        title: "Success",
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
  const { disable } = useLimitsInFreePlan({ key: "quotes" });

  const deleting = estimateStatus === "deleting";
  return (
    <MainLayout>
      <Box p={4}>
        {loading ? (
          <Flex justifyContent={"center"} alignItems={"center"}>
            <Spinner size={"md"} />
          </Flex>
        ) : (
          <TableLayout
            isAddDisabled={disable}
            filter={
              <BillFilter
                dateFilter={dateFilter}
                onChangeDateFilter={onChangeDateFilter}
              />
            }
            limitKey={"quotes"}
            heading={"Quotations"}
            tableData={estimates.map(estimateTableMapper)}
            caption={`Total estimates found : ${totalCount}`}
            operations={estimates.map((estimate) => (
              <VertIconMenu
                convertToInvoice={() => {
                  convertToInvoice(estimate);
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
              num: "Quote No.",
              date: "Quotation Date",
              partyName: "Party name",
              status: "Status",
              grandTotal: "Total",
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
          body={"Do you want to delete the estimate"}
          header={"Delete Quotation"}
          isOpen={isDeleteModalOpen}
          onClose={onCloseDeleteModal}
          onConfirm={() => deleteQuote(quotation)}
        />
        {loading ? null : (
          <Pagination total={totalPages} currentPage={currentPage} />
        )}
      </Box>
    </MainLayout>
  );
}
