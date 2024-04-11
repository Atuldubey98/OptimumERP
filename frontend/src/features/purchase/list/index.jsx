import {
  Box,
  Link as ChakraLink,
  Flex,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { useContext, useState } from "react";
import {
  Link as ReactRouterLink,
  useNavigate,
  useParams,
} from "react-router-dom";
import { purchaseStatusList } from "../../../constants/purchase";
import SettingContext from "../../../contexts/SettingContext";
import useAsyncCall from "../../../hooks/useAsyncCall";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
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
import PayoutModal from "./PayoutModal";
export default function PurchasePage() {
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
  const { symbol } = useCurrentOrgCurrency();

  const navigate = useNavigate();
  const purchaseTableMapper = (purchase) => ({
    partyName: (
      <ChakraLink
        as={ReactRouterLink}
        to={`/${orgId}/parties/${purchase.party._id}/transactions`}
      >
        {purchase.party ? purchase.party.name : ""}
      </ChakraLink>
    ),
    ...purchase,
    purchaseNo: transactionPrefixInvoice + purchase.purchaseNo,
    date: new Date(purchase.date).toISOString().split("T")[0],
    grandTotal: `${symbol} ${(purchase.total + purchase.totalTax).toFixed(2)}`,
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
  const [purchaseStatus, setPurchaseStatus] = useState("idle");
  const deleteInvoice = requestAsyncHandler(async (purchase) => {
    if (!purchase) return;
    setPurchaseStatus("deleting");
    await instance.delete(
      `/api/v1/organizations/${orgId}/purchases/${purchase._id}`
    );
    onCloseDeleteModal();
    fetchPurchases();
    setPurchaseStatus("idle");
  });
  const deleting = purchaseStatus === "deleting";
  const onClickAddNewInvoice = () => {
    navigate(`create`);
  };
  const onSaveBill = async (item) => {
    const currentPurchase = item || purchase;

    if (!currentPurchase) return;
    const downloadBill = `/api/v1/organizations/${orgId}/purchases/${
      currentPurchase._id
    }/download?template=${localStorage.getItem("template") || "simple"}`;
    const { data } = await instance.get(downloadBill, {
      responseType: "blob",
    });
    const href = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.setAttribute("download", `Purchase-${currentPurchase.purchaseNo}.pdf`);
    link.href = href;
    link.click();
    URL.revokeObjectURL(href);
  };
  const {
    isOpen: isPayoutOpen,
    onOpen: openPayout,
    onClose: closePayout,
  } = useDisclosure();
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
                onChangeDateFilter={onChangeDateFilter}
                dateFilter={dateFilter}
              />
            }
            heading={"Purchases"}
            tableData={purchases.map(purchaseTableMapper)}
            caption={`Total purchases found : ${totalCount}`}
            operations={purchases.map((purchase) => (
              <VertIconMenu
                payoutPurchase={() => {
                  setInvoice(purchase);
                  openPayout();
                }}
                onDownloadItem={() => {
                  onSaveBill(purchase);
                }}
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
              purchaseNo: "Purchase No.",
              date: "Purchase Date",
              partyName: "Party name",
              status: "Status",
              grandTotal: "Total",
            }}
            onAddNewItem={onClickAddNewInvoice}
          />
        )}
        {purchase ? (
          <BillModal
            bill={purchase}
            onSaveBill={onSaveBill}
            entity={"purchases"}
            heading={"Purchase"}
            isOpen={isOpen}
            onClose={onClose}
          />
        ) : null}
        {purchase ? (
          <PayoutModal
            fetchPurchases={fetchPurchases}
            isOpen={isPayoutOpen}
            onClose={closePayout}
            purchase={purchase}
          />
        ) : null}
        <AlertModal
          confirmDisable={deleting}
          buttonLabel="Delete"
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
