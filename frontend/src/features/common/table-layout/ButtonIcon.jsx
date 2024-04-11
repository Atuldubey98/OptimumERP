import React from "react";
import { Show, IconButton, Button } from "@chakra-ui/react";
export default function ButtonIcon({ onClick, icon, label }) {
  return (
    <>
      <Show above="md">
        <Button
          leftIcon={icon}
          onClick={onClick}
          size={"sm"}
          colorScheme="blue"
        >
          {label}
        </Button>
      </Show>
      <Show below="md">
        <IconButton
          icon={icon}
          onClick={onClick}
          size={"sm"}
          colorScheme="blue"
        />
      </Show>
    </>
  );
}
