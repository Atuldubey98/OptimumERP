import { Box, Flex, Spinner, useDisclosure } from "@chakra-ui/react";
import { useCallback, useContext, useState } from "react";
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
import SettingContext from "../../../contexts/SettingContext";
export default function EstimatesPage() {
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
  const settingContext = useContext(SettingContext);
  const transactionPrefixQuotation =
    settingContext?.setting?.transactionPrefix.quotation || "";
  const estimateTableMapper = (estimate) => ({
    customerName: estimate.customer.name,
    billingAddress: estimate.customer.billingAddress,
    ...estimate,
    quoteNo: `${transactionPrefixQuotation}${estimate.quoteNo}`,
    date: new Date(estimate.date).toISOString().split("T")[0],
    grandTotal: estimate.total + estimate.totalTax,
    status: <Status status={estimate.status} statusList={statusList} />,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [quotation, setQuotation] = useState(null);
  const onOpenQuotation = (estimate) => {
    setQuotation(estimate);
    onOpen();
  };
  const { requestAsyncHandler } = useAsyncCall();
  const { orgId } = useParams();
  const {
    isOpen: isDeleteModalOpen,
    onClose: onCloseDeleteModal,
    onOpen: onOpenDeleteModal,
  } = useDisclosure();
  const deleteQuote = requestAsyncHandler(async (estimate) => {
    if (!estimate) return;
    await instance.delete(
      `/api/v1/organizations/${orgId}/quotes/${estimate._id}`
    );
    onCloseDeleteModal();
    fetchQuotes();
  });

  return (
    <MainLayout>
      <Box p={5}>
        {loading ? (
          <Flex justifyContent={"center"} alignItems={"center"}>
            <Spinner size={"md"} />
          </Flex>
        ) : (
          <TableLayout
            filter={
              <BillFilter
                dateFilter={dateFilter}
                onChangeDateFilter={onChangeDateFilter}
              />
            }
            heading={"Quotations"}
            tableData={estimates.map(estimateTableMapper)}
            caption={`Total estimates found : ${totalCount}`}
            operations={estimates.map((estimate) => (
              <VertIconMenu
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
              date: "Quotation Date",
              status: "Status",
              customerName: "Customer name",
              quoteNo: "Quote No.",
              billingAddress: "Billing address",
              grandTotal: "Total",
            }}
            onAddNewItem={onClickAddNewQuote}
          />
        )}
        {quotation ? (
          <BillModal
            isOpen={isOpen}
            onClose={onClose}
            bill={quotation}
            entity={"quotes"}
            heading={"Quotation"}
          />
        ) : null}
        <AlertModal
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
