import {
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import React from "react";
import { CiEdit, CiSaveDown2 } from "react-icons/ci";
import { LiaEyeSolid } from "react-icons/lia";
import { RiDeleteBin2Line } from "react-icons/ri";
import { RxDotsVertical } from "react-icons/rx";
import { CiMoneyBill } from "react-icons/ci";
export default function VertIconMenu({
  showItem,
  editItem,
  deleteItem,
  onDownloadItem,
  showTransactions,
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
        {showTransactions ? (
          <MenuItem command="⌘T" icon={<CiMoneyBill size={20} />} onClick={showTransactions}>
            Transactions
          </MenuItem>
        ) : null}
        <MenuItem icon={<CiEdit size={20} />} onClick={editItem} command="⌘E">
          Edit
        </MenuItem>
        {onDownloadItem ? (
          <MenuItem
            onClick={onDownloadItem}
            icon={<CiSaveDown2 size={20} />}
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
