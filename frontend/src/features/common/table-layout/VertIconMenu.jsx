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
import { GoTag } from "react-icons/go";
import { LiaEyeSolid } from "react-icons/lia";
import { RiDeleteBin2Line } from "react-icons/ri";
import { RxDotsVertical } from "react-icons/rx";
import { TiContacts } from "react-icons/ti";
export default function VertIconMenu({
  showItem,
  editItem,
  deleteItem,
  onDownloadItem,
  showTransactions,
  recordPayment,
  showProducts,
  showContacts,
  downloading = false,
}) {
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Options"
        icon={<RxDotsVertical />}
        variant="outline"
      />
      <MenuList>
        {showItem ? (
          <MenuItem
            icon={<LiaEyeSolid size={20} />}
            onClick={showItem}
            command="⌘S"
          >
            Show
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
            Record Payment
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
        <MenuItem icon={<CiEdit size={20} />} onClick={editItem} command="⌘E">
          Edit
        </MenuItem>
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
        <MenuItem
          icon={<RiDeleteBin2Line color="red" size={20} />}
          onClick={deleteItem}
          command="⌘D"
        >
          Delete
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
