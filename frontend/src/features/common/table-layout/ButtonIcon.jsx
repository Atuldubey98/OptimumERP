import React from "react";
import { Show, IconButton, Button } from "@chakra-ui/react";
export default function ButtonIcon({
  onClick,
  icon,
  label,
  isDisabled = false,
}) {
  return (
    <>
      <Show above="md">
        <Button
          isDisabled={isDisabled}
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
          isDisabled={isDisabled}
          icon={icon}
          onClick={onClick}
          size={"sm"}
          colorScheme="blue"
        />
      </Show>
    </>
  );
}
