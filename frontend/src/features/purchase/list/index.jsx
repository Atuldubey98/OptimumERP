import {
  Box,
  Flex,
  Spinner,
  useDisclosure
} from "@chakra-ui/react";
import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { purchaseStatusList } from "../../../constants/purchase";
import SettingContext from "../../../contexts/SettingContext";
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
import TableDateFilter from "../../invoices/list/TableDateFilter";
export default function InvoicesPage() {
  const {
    items: purchases,
    dateFilter,
    onChangeDateFilter,
    currentPage,
    totalPages,
    totalCount,
    fetchItems: fetchPurchases,
    status,
  } = useDateFilterFetch({
    entity: "purchases",
  });
  const loading = status === "loading";
  const settingContext = useContext(SettingContext);
  const transactionPrefixInvoice =
    settingContext?.setting?.transactionPrefix.purchase || "";
  const navigate = useNavigate();
  const purchaseTableMapper = (purchase) => ({
    customerName: purchase.customer.name,
    billingAddress: purchase.customer.billingAddress,
    ...purchase,
    purchaseNo: transactionPrefixInvoice + purchase.purchaseNo,
    date: new Date(purchase.date).toISOString().split("T")[0],
    grandTotal: (purchase.total + purchase.totalTax).toFixed(2),
    status: <Status status={purchase.status} statusList={purchaseStatusList} />,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [purchase, setInvoice] = useState(null);
  const onOpenInvoice = (currentPurchase) => {
    setInvoice(currentPurchase);
    onOpen();
  };
  const { requestAsyncHandler } = useAsyncCall();
  const { orgId } = useParams();
  const {
    isOpen: isDeleteModalOpen,
    onClose: onCloseDeleteModal,
    onOpen: onOpenDeleteModal,
  } = useDisclosure();
  const deleteInvoice = requestAsyncHandler(async (purchase) => {
    if (!purchase) return;
    await instance.delete(
      `/api/v1/organizations/${orgId}/purchases/${purchase._id}`
    );
    onCloseDeleteModal();
    fetchPurchases();
  });
  const onClickAddNewInvoice = () => {
    navigate(`create`);
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
                onChangeDateFilter={onChangeDateFilter}
                dateFilter={dateFilter}
              />
            }
            heading={"Purchases"}
            tableData={purchases.map(purchaseTableMapper)}
            caption={`Total purchases found : ${totalCount}`}
            operations={purchases.map((purchase) => (
              <VertIconMenu
                showItem={() => onOpenInvoice(purchase)}
                editItem={() => {
                  navigate(`${purchase._id}/edit`);
                }}
                deleteItem={() => {
                  setInvoice(purchase);
                  onOpenDeleteModal();
                }}
              />
            ))}
            selectedKeys={{
              date: "Purchase Date",
              status: "Status",
              customerName: "Customer name",
              purchaseNo: "Purchase No.",
              billingAddress: "Billing address",
              grandTotal: "Total",
            }}
            onAddNewItem={onClickAddNewInvoice}
          />
        )}
        {purchase ? (
          <BillModal
            bill={purchase}
            entity={"purchases"}
            heading={"Purchase"}
            isOpen={isOpen}
            onClose={onClose}
          />
        ) : null}
        <AlertModal
          body={"Do you want to delete the purchase ?"}
          header={"Delete Purchase"}
          isOpen={isDeleteModalOpen}
          onClose={onCloseDeleteModal}
          onConfirm={() => deleteInvoice(purchase)}
        />
        {loading ? null : (
          <Pagination currentPage={currentPage} total={totalPages} />
        )}
      </Box>
    </MainLayout>
  );
}
