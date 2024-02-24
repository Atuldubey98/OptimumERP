import {
  Box,
  Divider,
  Flex,
  Grid,
  Spinner,
  Tag,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAsyncCall from "../../hooks/useAsyncCall";
import useEsitamtes from "../../hooks/useEsimates";
import instance from "../../instance";
import MainLayout from "../common/main-layout";
import TableLayout from "../common/table-layout";
import SearchItem from "../common/table-layout/SearchItem";
import VertIconMenu from "../common/table-layout/VertIconMenu";
import { statusList } from "./create/data";
import DateFilter from "./list/DateFilter";
import QuoteModal from "./list/QuoteModal";
import AlertModal from "../common/AlertModal";

export default function EstimatesPage() {
  const navigate = useNavigate();
  const onClickAddNewQuote = () => {
    navigate(`create`);
  };
  const { estimates, onChangeDateFilter, dateFilter, status, fetchQuotes } =
    useEsitamtes();
  const loading = status === "loading";
  const estimateTableMapper = (estimate) => ({
    customerName: estimate.customer.name,
    billingAddress: estimate.customer.billingAddress,
    ...estimate,
    date: new Date(estimate.date).toISOString().split("T")[0],
    grandTotal: estimate.total + estimate.totalTax,
    status: (
      <Tag
        textTransform={"capitalize"}
        size={"md"}
        variant={"solid"}
        colorScheme={
          statusList.find((statusItem) => statusItem.type === estimate.status)
            .colorScheme || "blue"
        }
      >
        {estimate.status}
      </Tag>
    ),
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
      {loading ? (
        <Flex justifyContent={"center"} alignItems={"center"}>
          <Spinner size={"md"} />
        </Flex>
      ) : (
        <TableLayout
          filter={
            <Grid gap={2}>
              <Divider />
              <Box>
                <SearchItem placeholder="Search by description" />
              </Box>
              <Grid gap={5} gridTemplateColumns={"1fr 1fr"}>
                <DateFilter
                  dateFilter={dateFilter}
                  onChangeDateFilter={onChangeDateFilter}
                />
              </Grid>
              <Divider />
            </Grid>
          }
          heading={"Quotations"}
          tableData={estimates.map(estimateTableMapper)}
          caption={`Total estimates found : ${estimates.length}`}
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
        <QuoteModal isOpen={isOpen} onClose={onClose} quotation={quotation} />
      ) : null}
      <AlertModal
        body={"Do you want to delete the estimate"}
        header={"Delete Quotation"}
        isOpen={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
        onConfirm={() => deleteQuote(quotation)}
      />
    </MainLayout>
  );
}
