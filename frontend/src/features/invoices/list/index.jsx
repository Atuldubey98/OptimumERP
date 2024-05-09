import {
  Box,
  Link as ChakraLink,
  Flex,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { isAxiosError } from "axios";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { invoiceStatusList } from "../../../constants/invoice";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import useDateFilterFetch from "../../../hooks/useDateFilterFetch";
import useLimitsInFreePlan from "../../../hooks/useLimitsInFreePlan";
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
    invoiceNo: invoice.num,
    date: new Date(invoice.date).toLocaleDateString(),
    grandTotal: `${symbol} ${(invoice.total + invoice.totalTax).toFixed(2)}`,
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
  const onClickAddNewInvoice = () => {
    navigate(`create`);
  };

  const onSaveBill = async (item) => {
    const currentInvoice = item || invoice;
    const downloadBill = `/api/v1/organizations/${
      currentInvoice.org._id
    }/invoices/${currentInvoice._id}/download?template=${
      localStorage.getItem("template") || "simple"
    }`;
    const { data } = await instance.get(downloadBill, {
      responseType: "blob",
    });
    const href = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.setAttribute("download", `Invoice-${currentInvoice.num}.pdf`);
    link.href = href;
    link.click();
    URL.revokeObjectURL(href);
  };
  const downloading = invoiceStatus === "downloading";
  const {
    isOpen: isRecordPaymentModalOpen,
    onOpen: openRecordPaymentModal,
    onClose: closeRecordPaymentModal,
  } = useDisclosure();
  const { disable } = useLimitsInFreePlan({ key: "invoices" });

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
            isAddDisabled={disable}
            heading={"Invoices"}
            tableData={invoices.map(invoiceTableMapper)}
            caption={`Total invoices found : ${totalCount}`}
            operations={invoices.map((invoice) => (
              <VertIconMenu
                recordPayment={() => {
                  setInvoice(invoice);
                  openRecordPaymentModal();
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
              invoiceNo: "Invoice No.",
              date: "Invoice Date",
              partyName: "Recipient",
              status: "Status",
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
      </Box>
    </MainLayout>
  );
}
