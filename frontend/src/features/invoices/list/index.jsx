import {
  Box,
  Divider,
  Flex,
  Grid,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import useDateFilterFetch from "../../../hooks/useDateFilterFetch";
import MainLayout from "../../common/main-layout";
import { useState } from "react";
import TableLayout from "../../common/table-layout";
import SearchItem from "../../common/table-layout/SearchItem";
import DateFilter from "../../estimates/list/DateFilter";
import useAsyncCall from "../../../hooks/useAsyncCall";
import { useNavigate, useParams } from "react-router-dom";
import VertIconMenu from "../../common/table-layout/VertIconMenu";
import AlertModal from "../../common/AlertModal";
import BillModal from "../../estimates/list/BillModal";
import instance from "../../../instance";

export default function InvoicesPage() {
  const {
    items: invoices,
    dateFilter,
    onChangeDateFilter,
    fetchItems: fetchInvoices,
    status,
  } = useDateFilterFetch({
    entity: "invoices",
  });
  const loading = status === "loading";
  const navigate = useNavigate();
  const invoiceTableMapper = (invoice) => ({
    customerName: invoice.customer.name,
    billingAddress: invoice.customer.billingAddress,
    ...invoice,
    date: new Date(invoice.date).toISOString().split("T")[0],
    grandTotal: invoice.total + invoice.totalTax,
    status: invoice.status,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [invoice, setInvoice] = useState(null);
  const onOpenInvoice = (currentInvoice) => {
    setInvoice(currentInvoice);
    onOpen();
  };
  const { requestAsyncHandler } = useAsyncCall();
  const { orgId } = useParams();
  const {
    isOpen: isDeleteModalOpen,
    onClose: onCloseDeleteModal,
    onOpen: onOpenDeleteModal,
  } = useDisclosure();
  const deleteInvoice = requestAsyncHandler(async (invoice) => {
    if (!invoice) return;
    await instance.delete(
      `/api/v1/organizations/${orgId}/invoices/${invoice._id}`
    );
    onCloseDeleteModal();
    fetchInvoices();
  });
  const onClickAddNewInvoice = () => {
    navigate(`create`);
  };
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
          heading={"Invoices"}
          tableData={invoices.map(invoiceTableMapper)}
          caption={`Total invoices found : ${invoices.length}`}
          operations={invoices.map((invoice) => (
            <VertIconMenu
              showItem={() => onOpenInvoice(invoice)}
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
            date: "Invoice Date",
            status: "Status",
            customerName: "Customer name",
            invoiceNo: "Invoice No.",
            billingAddress: "Billing address",
            grandTotal: "Total",
          }}
          onAddNewItem={onClickAddNewInvoice}
        />
      )}
      {invoice ? (
        <BillModal
          bill={invoice}
          entity={"invoices"}
          heading={"Invoice"}
          isOpen={isOpen}
          onClose={onClose}
        />
      ) : null}
      <AlertModal
        body={"Do you want to delete the invoice ?"}
        header={"Delete Invoice"}
        isOpen={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
        onConfirm={() => deleteInvoice(invoice)}
      />
    </MainLayout>
  );
}
