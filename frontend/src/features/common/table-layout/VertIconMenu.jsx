import React from "react";
import {
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { RxDotsHorizontal } from "react-icons/rx";
import { LiaEyeSolid } from "react-icons/lia";
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin2Line } from "react-icons/ri";
export default function VertIconMenu({ showItem, editItem, deleteItem }) {
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Options"
        icon={<RxDotsHorizontal />}
        variant="outline"
      />
      <MenuList>
        <MenuItem
          icon={<LiaEyeSolid size={20} />}
          onClick={showItem}
          command="⌘S"
        >
          Show
        </MenuItem>
        <MenuItem icon={<CiEdit size={20} />} onClick={editItem} command="⌘E">
          Edit
        </MenuItem>
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
