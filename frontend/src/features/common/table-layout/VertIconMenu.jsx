import {
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import React from "react";
import { CiEdit } from "react-icons/ci";
import { LiaEyeSolid } from "react-icons/lia";
import { RiDeleteBin2Line } from "react-icons/ri";
import { RxDotsVertical } from "react-icons/rx";
export default function VertIconMenu({ showItem, editItem, deleteItem }) {
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
