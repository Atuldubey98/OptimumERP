import { Box, Flex, Spinner, useDisclosure } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { invoiceStatusList } from "../../../constants/invoice";
import useAsyncCall from "../../../hooks/useAsyncCall";
import useDateFilterFetch from "../../../hooks/useDateFilterFetch";
import instance from "../../../instance";
import AlertModal from "../../common/AlertModal";
import MainLayout from "../../common/main-layout";
import Pagination from "../../common/main-layout/Pagination";
import TableLayout from "../../common/table-layout";
import VertIconMenu from "../../common/table-layout/VertIconMenu";
import BillModal from "../../estimates/list/BillModal";
import Status from "../../estimates/list/Status";
import TableDateFilter from "./TableDateFilter";
export default function InvoicesPage() {
  const {
    items: invoices,
    dateFilter,
    onChangeDateFilter,
    currentPage,
    totalPages,
    totalCount,
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
    invoiceNo: invoice.num,
    date: new Date(invoice.date).toISOString().split("T")[0],
    grandTotal: (invoice.total + invoice.totalTax).toFixed(2),
    status: <Status status={invoice.status} statusList={invoiceStatusList} />,
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
  const [invoiceStatus, setInvoiceStatus] = useState("idle");
  const deleteInvoice = requestAsyncHandler(async (invoice) => {
    if (!invoice) return;
    setInvoiceStatus("deleting");
    await instance.delete(
      `/api/v1/organizations/${orgId}/invoices/${invoice._id}`
    );
    onCloseDeleteModal();
    setInvoiceStatus("idle");
    fetchInvoices();
  });
  const deleting = invoiceStatus === "deleting";
  const onClickAddNewInvoice = () => {
    navigate(`create`);
  };
  const onSaveBill = async (item) => {
    const currentInvoice = item || invoice;
    const downloadBill = `/api/v1/organizations/${currentInvoice.org._id}/invoices/${currentInvoice._id}/download?template=simple`;
    const { data } = await instance.get(downloadBill, {
      responseType: "blob",
    });
    const href = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.setAttribute("download", "file.pdf");
    link.href = href;
    link.click();
    URL.revokeObjectURL(href);
  };

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
              <TableDateFilter
                dateFilter={dateFilter}
                onChangeDateFilter={onChangeDateFilter}
              />
            }
            heading={"Invoices"}
            tableData={invoices.map(invoiceTableMapper)}
            caption={`Total invoices found : ${totalCount}`}
            operations={invoices.map((invoice) => (
              <VertIconMenu
                showItem={() => onOpenInvoice(invoice)}
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
            onSaveBill={onSaveBill}
            onClose={onClose}
          />
        ) : null}
        <AlertModal
          confirmDisable={deleting}
          body={"Do you want to delete the invoice ?"}
          header={"Delete Invoice"}
          isOpen={isDeleteModalOpen}
          onClose={onCloseDeleteModal}
          onConfirm={() => deleteInvoice(invoice)}
        />
        {loading ? null : (
          <Pagination currentPage={currentPage} total={totalPages} />
        )}
      </Box>
    </MainLayout>
  );
}
