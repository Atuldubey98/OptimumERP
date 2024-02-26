import {
  Box,
  Divider,
  Flex,
  Grid,
  Spinner,
  Tag,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAsyncCall from "../../../hooks/useAsyncCall";
import useEsitamtes from "../../../hooks/useEsimates";
import instance from "../../../instance";
import MainLayout from "../../common/main-layout";
import TableLayout from "../../common/table-layout";
import SearchItem from "../../common/table-layout/SearchItem";
import VertIconMenu from "../../common/table-layout/VertIconMenu";
import { statusList } from "../create/data";
import DateFilter from "./DateFilter";
import BillModal from "./BillModal";
import AlertModal from "../../common/AlertModal";
import useDateFilterFetch from "../../../hooks/useDateFilterFetch";
import Status from "./Status";
import BillFilter from "./BillFilter";
import Pagination from "../../common/main-layout/Pagination";
import useQuery from "../../../hooks/useQuery";
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
  const estimateTableMapper = (estimate) => ({
    customerName: estimate.customer.name,
    billingAddress: estimate.customer.billingAddress,
    ...estimate,
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
  const query = useQuery();
  return (
    <MainLayout>
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
      <Pagination total={totalPages} currentPage={currentPage} />
    </MainLayout>
  );
}
