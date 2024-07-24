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

export default function VertIconMenu({
  showItem,
  editItem,
  deleteItem,
  onDownloadItem,
  showTransactions,
  recordPayment,
  showProducts,
  showExpenses,
  showContacts,
  downloading = false,
  convertToInvoice,
  payoutPurchase,
  onOverviewItem,
}) {
  return (
    <Menu>
      <MenuButton
        size={"sm"}
        as={IconButton}
        aria-label="Options"
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
            Expenses
          </MenuItem>
        ) : null}
        {onOverviewItem ? (
          <MenuItem
            icon={<GrOverview />}
            onClick={onOverviewItem}
            command="⌘O"
          />
        ) : null}
        {showItem ? (
          <MenuItem
            icon={<LiaEyeSolid size={20} />}
            onClick={showItem}
            command="⌘S"
          >
            Show
          </MenuItem>
        ) : null}
        {payoutPurchase ? (
          <MenuItem
            icon={<GiExpense size={20} />}
            onClick={payoutPurchase}
            command="⌘P"
          >
            Payment out
          </MenuItem>
        ) : null}
        {convertToInvoice ? (
          <MenuItem
            icon={<FaFileInvoiceDollar size={20} />}
            onClick={convertToInvoice}
            command="⌘I"
          >
            Convert to Invoice
          </MenuItem>
        ) : null}
        {showProducts ? (
          <MenuItem
            icon={<GoTag size={20} />}
            onClick={showProducts}
            command="⌘S"
          >
            Products
          </MenuItem>
        ) : null}
        {showContacts ? (
          <MenuItem
            icon={<TiContacts size={20} />}
            onClick={showContacts}
            command="⌘C"
          >
            Contacts
          </MenuItem>
        ) : null}
        {recordPayment ? (
          <MenuItem
            onClick={recordPayment}
            icon={<FaMoneyCheck size={20} />}
            command="⌘M"
          >
            Payment In
          </MenuItem>
        ) : null}
        {showTransactions ? (
          <MenuItem
            command="⌘T"
            icon={<CiMoneyBill size={20} />}
            onClick={showTransactions}
          >
            Transactions
          </MenuItem>
        ) : null}
        {editItem ? (
          <MenuItem icon={<CiEdit size={20} />} onClick={editItem} command="⌘E">
            Edit
          </MenuItem>
        ) : null}
        {onDownloadItem ? (
          <MenuItem
            onClick={onDownloadItem}
            icon={downloading ? <Spinner /> : <CiSaveDown2 size={20} />}
            command="⌘J"
          >
            Download
          </MenuItem>
        ) : null}
        <Divider />
        {deleteItem ? (
          <MenuItem
            icon={<RiDeleteBin2Line color="red" size={20} />}
            onClick={deleteItem}
            command="⌘D"
          >
            Delete
          </MenuItem>
        ) : null}
      </MenuList>
    </Menu>
  );
}
