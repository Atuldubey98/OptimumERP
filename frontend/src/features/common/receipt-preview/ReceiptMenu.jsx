import {
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList
} from "@chakra-ui/react";
import React from "react";
import { RxHamburgerMenu } from "react-icons/rx";
export default function ReceiptMenu(props) {
  return (
    <Menu>
      <MenuButton
        size={"sm"}
        as={IconButton}
        aria-label="Options"
        icon={<RxHamburgerMenu />}
        variant="outline"
      />
      <MenuList>
        {props.headerButtons.map((headerButton, index) => (
          <MenuItem
            key={index}
            onClick={headerButton.onClick}
            icon={headerButton.icon}
          >
            {headerButton.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
