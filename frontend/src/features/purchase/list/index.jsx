import {
  Box,
  Link as ChakraLink,
  Flex,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  Link as ReactRouterLink,
  useNavigate,
  useParams,
} from "react-router-dom";
import { purchaseStatusList } from "../../../constants/purchase";
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
import moment from "moment";
import ExporterModal from "../../common/ExporterModal";
import ShareBillModal from "../../common/ShareBillModal";
import { useTranslation } from "react-i18next";
import useSaveBill from "../../../hooks/useSaveBill";

const getBillGrandTotal = (bill) =>
  Number(bill?.total || 0) +
  Number(bill?.totalTax || 0) +
  Number(bill?.shippingCharges || 0);

export default function PurchasePage() {
  const { t, i18n } = useTranslation("purchase");
  const { saveBill } = useSaveBill();
  const {
    items: purchases,
    dateFilter,
    reachedLimit,
    reachedVouchersLimit: voucherLimitReached,
    onChangeDateFilter,
    currentPage,
    totalPages,
    totalCount,
    fetchItems: fetchPurchases,
    status,
  } = useDateFilterFetch({
    entity: "purchases",
    storageKey: "dateFilter:purchases",
    extraParams: {
      select: "num date party status total totalTax shippingCharges org",
    },
  });
  const loading = status === "loading";

  const { formatSmallestUnitWithSymbol } = useCurrentOrgCurrency();

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
    num: purchase.num,
    date: moment(purchase.date).format("LL"),
    grandTotal: formatSmallestUnitWithSymbol(getBillGrandTotal(purchase)),
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
    await saveBill(currentPurchase, "purchases", {
      orgId,
      params: {
        template: localStorage.getItem("template") || "simple",
      },
    });
  };
  const {
    isOpen: isPayoutOpen,
    onOpen: openPayout,
    onClose: closePayout,
  } = useDisclosure();
  const { isOpen: isShareModalOpen, onToggle: toggleShareModal } =
    useDisclosure();
  return (
    
      <Box p={4}>
        {loading ? (
          <Flex justifyContent={"center"} alignItems={"center"}>
            <Spinner size={"md"} />
          </Flex>
        ) : (
          <TableLayout
            isAddDisabled={reachedLimit}
            filter={
              <TableDateFilter
                onChangeDateFilter={onChangeDateFilter}
                dateFilter={dateFilter}
              />
            }
            limitKey={"purchases"}
            heading={t("purchase_ui.page.heading")}
            tableData={purchases.map(purchaseTableMapper)}
            caption={`${t("purchase_ui.page.total_found")} : ${totalCount}`}
            operations={purchases.map((purchase) => (
              <VertIconMenu
                payoutPurchaseDisabled={voucherLimitReached}
                shareItem={() => {
                  setInvoice(purchase);
                  toggleShareModal();
                }}
                payoutPurchase={() => {
                  setInvoice(purchase);
                  openPayout();
                }}
                openItem={() => {
                  navigate(`/${orgId}/receipt/purchases/${purchase._id}`);
                }}
                onDownloadItem={() => {
                  onSaveBill(purchase);
                }}
                showItem={() => onOpenInvoice(purchase)}
                editItem={() => {
                  navigate(`${purchase._id}/edit`);
                }}
                showVouchers={() => {
                  navigate(`${purchase._id}/vouchers`, { state: { type: "purchase", data: purchase } });
                }}

                deleteItem={() => {
                  setInvoice(purchase);
                  onOpenDeleteModal();
                }}
              />
            ))}
            selectedKeys={{
              num: t("purchase_ui.table.columns.num"),
              date: t("purchase_ui.table.columns.date"),
              partyName: t("purchase_ui.table.columns.party_name"),
              status: t("purchase_ui.table.columns.status"),
              grandTotal: t("purchase_ui.table.columns.total"),
            }}
            onAddNewItem={onClickAddNewInvoice}
          />
        )}
        {purchase ? (
          <BillModal
            bill={purchase}
            onSaveBill={onSaveBill}
            entity={"purchases"}
            heading={t("purchase_ui.bill_modal.heading")}
            isOpen={isOpen}
            onClose={onClose}
          />
        ) : null}
        {purchase ? (
          <ShareBillModal
            bill={purchase}
            isOpen={isShareModalOpen}
            onClose={toggleShareModal}
            billType={"purchases"}
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
          buttonLabel={t("purchase_ui.modal.delete_button")}
          body={t("purchase_ui.modal.delete_body")}
          header={t("purchase_ui.modal.delete_header")}
          isOpen={isDeleteModalOpen}
          onClose={onCloseDeleteModal}
          onConfirm={() => deleteInvoice(purchase)}
        />
        {loading ? null : (
          <Pagination currentPage={currentPage} total={totalPages} />
        )}
      </Box>
    
  );
}
