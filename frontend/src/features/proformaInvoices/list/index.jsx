import {
  Box,
  Flex,
  Spinner,
  useDisclosure,
  useToast,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { isAxiosError } from "axios";
import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import useDateFilterFetch from "../../../hooks/useDateFilterFetch";
import instance from "../../../instance";
import AlertModal from "../../common/AlertModal";
import MainLayout from "../../common/main-layout";
import Pagination from "../../common/main-layout/Pagination";
import TableLayout from "../../common/table-layout";
import VertIconMenu from "../../common/table-layout/VertIconMenu";
import BillModal from "../../estimates/list/BillModal";
import TableDateFilter from "../../invoices/list/TableDateFilter";
import Status from "../../estimates/list/Status";
import { invoiceStatusList } from "../../../constants/invoice";
import useLimitsInFreePlan from "../../../hooks/useLimitsInFreePlan";
import moment from 'moment';
export default function ProformaInvoicesPage() {
  const {
    items,
    dateFilter,
    onChangeDateFilter,
    currentPage,
    totalPages,
    totalCount,
    fetchItems: fetchFn,
    status,
  } = useDateFilterFetch({
    entity: "proformaInvoices",
  });
  const loading = status === "loading";
  const navigate = useNavigate();
  const { symbol } = useCurrentOrgCurrency();
  const { orgId } = useParams();
  const {
    isOpen: isAlertModalOpen,
    onOpen: openAlertModal,
    onClose: closeAlertModal,
  } = useDisclosure();
  const {
    isOpen: IsBillModalOpen,
    onOpen: openBillModal,
    onClose: closeBillModal,
  } = useDisclosure();
  const toast = useToast();
  const [proformaInvoiceSelected, setProformaInvoiceSelected] = useState(null);
  const [proformaInvoiceStatus, setProformaInvoiceStatus] = useState("idle");
  const deleteProformaInvoice = async () => {
    try {
      if (!proformaInvoiceSelected) return;
      setProformaInvoiceStatus("deleting");
      await instance.delete(
        `/api/v1/organizations/${orgId}/proformaInvoices/${proformaInvoiceSelected._id}`
      );
      closeAlertModal();
      fetchFn();
      setProformaInvoiceStatus("idle");
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
      setProformaInvoiceStatus("idle");
    }
  };

  const onSaveBill = async (item) => {
    const currentInvoice = item || invoice;
    const downloadBill = `/api/v1/organizations/${
      currentInvoice.org._id
    }/proformaInvoices/${currentInvoice._id}/download?template=${
      localStorage.getItem("template") || "simple"
    }`;
    const { data } = await instance.get(downloadBill, {
      responseType: "blob",
    });
    const href = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.setAttribute("download", `ProformaInvoice-${currentInvoice.num}.pdf`);
    link.href = href;
    link.click();
    URL.revokeObjectURL(href);
  };
  const convertToInvoice = async (proformaInvoice) => {
    try {
      const { data } = await instance.post(
        `/api/v1/organizations/${orgId}/proformaInvoices/${proformaInvoice._id}/convertToInvoice`
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
  const { disable } = useLimitsInFreePlan({ key: "proformaInvoices" });

  return (
    <MainLayout>
      <Box p={4}>
        {loading ? (
          <Flex justifyContent={"center"} alignItems={"center"}>
            <Spinner />
          </Flex>
        ) : (
          <TableLayout
            isAddDisabled={disable}
            limitKey={"proformaInvoices"}
            caption={`Total proforma invoices found : ${totalCount}`}
            heading={"Proforma Invoices"}
            operations={items.map((item) => (
              <VertIconMenu
                key={item._id}
                convertToInvoice={() => convertToInvoice(item)}
                onDownloadItem={() => onSaveBill(item)}
                showItem={() => {
                  setProformaInvoiceSelected(item);
                  openBillModal();
                }}
                deleteItem={() => {
                  setProformaInvoiceSelected(item);
                  openAlertModal();
                }}
                editItem={() => navigate(`${item._id}/edit`)}
              />
            ))}
            tableData={items.map((item) => ({
              ...item,
              date: moment(item.date).format("LL"),
              recipient: (
                <ChakraLink
                  to={`/${orgId}/parties/${item.party._id}/transactions`}
                  as={Link}
                >
                  {item.party.name}
                </ChakraLink>
              ),
              status: (
                <Status status={item.status} statusList={invoiceStatusList} />
              ),
              grandTotal: `${symbol} ${(item.totalTax + item.total).toFixed(
                2
              )}`,
            }))}
            onAddNewItem={() => navigate(`create`)}
            filter={
              <TableDateFilter
                dateFilter={dateFilter}
                onChangeDateFilter={onChangeDateFilter}
              />
            }
            selectedKeys={{
              num: "Number",
              date: "Date",
              recipient: "Recipient",
              status: "Status",
              grandTotal: "Grand Total",
            }}
          />
        )}
        <Pagination currentPage={currentPage} total={totalPages} />
      </Box>
      <AlertModal
        confirmDisable={proformaInvoiceStatus === "deleting"}
        body={"Do you want to delete the proforma Invoice ?"}
        header={"Delete proforma invoice"}
        isOpen={isAlertModalOpen}
        onClose={closeAlertModal}
        onConfirm={deleteProformaInvoice}
      />
      {proformaInvoiceSelected ? (
        <BillModal
          bill={proformaInvoiceSelected}
          entity={"proformaInvoices"}
          heading={"Proforma Invoice"}
          isOpen={IsBillModalOpen}
          onClose={closeBillModal}
        />
      ) : null}
    </MainLayout>
  );
}
