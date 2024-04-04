import { ListItem } from "@chakra-ui/react";
import React from "react";

export default function HeaderLink({ children }) {
  return (
    <ListItem
      cursor={"pointer"}
      display={"flex"}
      alignItems={"center"}
      justifyContent={"flex-start"}
      gap={2}
    >
      {children}
    </ListItem>
  );
}
