import {
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
} from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";
import useAuth from "../../../hooks/useAuth";
import { CiEdit, CiMoneyBill, CiSaveDown2 } from "react-icons/ci";
import { FaMoneyCheck } from "react-icons/fa";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { GiExpense } from "react-icons/gi";
import { GoTag } from "react-icons/go";
import { LiaEyeSolid } from "react-icons/lia";
import { RiDeleteBin2Line } from "react-icons/ri";
import { RxDotsVertical } from "react-icons/rx";
import { TiContacts } from "react-icons/ti";
import { GrOverview } from "react-icons/gr";
import { BsShare } from "react-icons/bs";
import { MdOutlineFileOpen, MdOutlinePayments } from "react-icons/md";
export default function VertIconMenu({
  showItem,
  editItem,
  deleteItem,
  onDownloadItem,
  showTransactions,
  recordPayment,
  showProducts,
  showExpenses,
  shareItem,
  showContacts,
  downloading = false,
  convertToInvoice,
  payoutPurchase,
  onOverviewItem,
  openItem,
  showVouchers,
  recordPaymentDisabled = false,
  payoutPurchaseDisabled = false,
}) {
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const currentFeatures = user?.features || {};
  const isSmtpEnabled = currentFeatures?.smtp ?? false;

  return (
    <Menu>
      <MenuButton
        size={"sm"}
        as={IconButton}
        aria-label={t("common_ui.actions.options")}
        icon={<RxDotsVertical />}
        variant="outline"
      />
      <MenuList>
        {showExpenses ? (
          <MenuItem
            icon={<GiExpense size={20} />}
            onClick={showExpenses}
            command="⌘X"
          >
            {t("common_ui.menu.expenses")}
          </MenuItem>
        ) : null}

        {onOverviewItem ? (
          <MenuItem
            icon={<GrOverview />}
            onClick={onOverviewItem}
            command="⌘G"
          />
        ) : null}
        {showItem ? (
          <MenuItem
            icon={<LiaEyeSolid size={20} />}
            onClick={showItem}
            command="⌘S"
          >
            {t("common_ui.actions.show")}
          </MenuItem>
        ) : null}
        {openItem ? (
          <MenuItem
            icon={<MdOutlineFileOpen size={20} />}
            onClick={openItem}
            command="⌘O"
          >
            {t("common_ui.actions.open")}
          </MenuItem>
        ) : null}
        {payoutPurchase ? (
          <MenuItem
            isDisabled={payoutPurchaseDisabled}
            icon={<GiExpense size={20} />}
            onClick={payoutPurchase}
            command="⌘P"
          >
            {t("common_ui.menu.payment_out")}
          </MenuItem>
        ) : null}

        {convertToInvoice ? (
          <MenuItem
            icon={<FaFileInvoiceDollar size={20} />}
            onClick={convertToInvoice}
            command="⌘I"
          >
            {t("common_ui.menu.convert_to_invoice")}
          </MenuItem>
        ) : null}
        {showProducts ? (
          <MenuItem
            icon={<GoTag size={20} />}
            onClick={showProducts}
            command="⌘L"
          >
            {t("common_ui.menu.products")}
          </MenuItem>
        ) : null}
        {showContacts ? (
          <MenuItem
            icon={<TiContacts size={20} />}
            onClick={showContacts}
            command="⌘C"
          >
            {t("common_ui.menu.contacts")}
          </MenuItem>
        ) : null}
        {recordPayment ? (
          <MenuItem
            isDisabled={recordPaymentDisabled}
            onClick={recordPayment}
            icon={<FaMoneyCheck size={20} />}
            command="⌘M"
          >
            {t("common_ui.menu.payment_in")}
          </MenuItem>
        ) : null}

        {showTransactions ? (
          <MenuItem
            command="⌘T"
            icon={<CiMoneyBill size={20} />}
            onClick={showTransactions}
          >
            {t("common_ui.menu.transactions")}
          </MenuItem>
        ) : null}
        {showVouchers ? (
          <MenuItem
            command="⌘V"
            icon={<MdOutlinePayments size={20} />}
            onClick={showVouchers}
          >
            {t("common_ui.menu.vouchers")}
          </MenuItem>
        ) : null}
        {editItem ? (
          <MenuItem icon={<CiEdit size={20} />} onClick={editItem} command="⌘E">
            {t("common_ui.actions.edit")}
          </MenuItem>
        ) : null}
        {onDownloadItem ? (
          <MenuItem
            onClick={onDownloadItem}
            icon={downloading ? <Spinner /> : <CiSaveDown2 size={20} />}
            command="⌘J"
          >
            {t("common_ui.actions.download")}
          </MenuItem>
        ) : null}
        <Divider />
        {shareItem && import.meta.env.VITE_SMTP_ENABLED === "true" && isSmtpEnabled ? (
          <MenuItem
            icon={<BsShare size={20} />}
            onClick={shareItem}
            command="⌘H"
          >
            {t("common_ui.actions.share")}
          </MenuItem>
        ) : null}
        {deleteItem ? (
          <MenuItem
            icon={<RiDeleteBin2Line color="red" size={20} />}
            onClick={deleteItem}
            command="⌘D"
          >
            {t("common_ui.actions.delete")}
          </MenuItem>
        ) : null}
      </MenuList>
    </Menu>
  );
}
