import {
  Box,
  Link as ChakraLink,
  Flex,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import moment from "moment";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { recurringInvoiceStatusList } from "../../../constants/recurringInvoice";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import useDateFilterFetch from "../../../hooks/useDateFilterFetch";
import instance from "../../../instance";
import AlertModal from "../../common/AlertModal";
import MainLayout from "../../common/main-layout";
import Pagination from "../../common/main-layout/Pagination";
import TableLayout from "../../common/table-layout";
import VertIconMenu from "../../common/table-layout/VertIconMenu";
import Status from "../../estimates/list/Status";
import useAuth from "../../../hooks/useAuth";
import TableDateFilter from "./TableDateFilter";


const getBillGrandTotal = (bill) =>
  Number(bill?.total || 0) +
  Number(bill?.totalTax || 0) +
  Number(bill?.shippingCharges || 0);

export default function RecurringInvoicesPage() {
  const { t } = useTranslation("recurringInvoice");
  const {
    items: recurringInvoices,
    dateFilter,
    onChangeDateFilter,
    currentPage,
    totalPages,
    totalCount,
    fetchItems: fetchRecurringInvoices,
    status,
  } = useDateFilterFetch({
    entity: "recurringInvoices",
    storageKey: "dateFilter:recurringInvoices",
    extraParams: {
      select: "date party status total totalTax shippingCharges interval nextOccurrence startDate endDate",
    },
  });
  const loading = status === "loading";
  const navigate = useNavigate();
  const { formatSmallestUnitWithSymbol } = useCurrentOrgCurrency();
  const { orgId } = useParams();
  const toast = useToast();

  const recurringInvoiceTableMapper = (ri) => ({
    partyName: (
      <ChakraLink
        to={`/${orgId}/parties/${ri.party._id}/transactions`}
        as={Link}
      >
        {ri.party.name}
      </ChakraLink>
    ),
    ...ri,
    startDate: ri.startDate ? moment(ri.startDate).format("LL") : "-",
    nextOccurrence: ri.nextOccurrence ? moment(ri.nextOccurrence).format("LL") : "-",
    grandTotal: formatSmallestUnitWithSymbol(getBillGrandTotal(ri)),
    status: <Status status={ri.status} statusList={recurringInvoiceStatusList} />,
    intervalLabel: t(`recurring_invoice_ui.interval.${ri.interval}`),
  });

  const {
    isOpen: isDeleteModalOpen,
    onClose: onCloseDeleteModal,
    onOpen: onOpenDeleteModal,
  } = useDisclosure();
  const [selectedRi, setSelectedRi] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState("idle");

  const deleteRecurringInvoice = async (ri) => {
    try {
      if (!ri) return;
      setDeleteStatus("deleting");
      await instance.delete(
        `/api/v1/organizations/${orgId}/recurringInvoices/${ri._id}`,
      );
      onCloseDeleteModal();
      fetchRecurringInvoices();
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
      setDeleteStatus("idle");
    }
  };

  return (
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
          limitKey={"recurringInvoices"}
          heading={t("recurring_invoice_ui.page.heading")}
          tableData={recurringInvoices.map(recurringInvoiceTableMapper)}
          caption={`${t("recurring_invoice_ui.page.total_found")} : ${totalCount}`}
          operations={recurringInvoices.map((ri) => (
            <VertIconMenu
              openItem={() => {
                navigate(`${ri._id}/view`);
              }}
              editItem={() => {
                navigate(`${ri._id}/edit`);
              }}
              deleteItem={() => {
                setSelectedRi(ri);
                onOpenDeleteModal();
              }}
            />
          ))}
          selectedKeys={{
            partyName: t("recurring_invoice_ui.table.columns.recipient"),
            intervalLabel: t("recurring_invoice_ui.table.columns.interval"),
            nextOccurrence: t("recurring_invoice_ui.table.columns.next_occurrence"),
            status: t("recurring_invoice_ui.table.columns.status"),
            grandTotal: t("recurring_invoice_ui.table.columns.total"),
          }}
          onAddNewItem={() => navigate("create")}
        />

      )}
      <AlertModal
        confirmDisable={deleteStatus === "deleting"}
        body={t("recurring_invoice_ui.modal.delete_body")}
        header={t("recurring_invoice_ui.modal.delete_header")}
        isOpen={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
        onConfirm={() => deleteRecurringInvoice(selectedRi)}
      />
      {loading ? null : (
        <Pagination currentPage={currentPage} total={totalPages} />
      )}
    </Box>
  );
}
