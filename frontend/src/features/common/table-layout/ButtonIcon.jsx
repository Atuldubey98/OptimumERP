import React from "react";
import { Show, IconButton, Button } from "@chakra-ui/react";
export default function ButtonIcon({
  onClick,
  icon,
  label,
  isDisabled = false,
  isLoading = false,
  colorScheme = "blue",
}) {
  return (
    <>
      <Show above="md">
        <Button
          isDisabled={isDisabled}
          leftIcon={icon}
          isLoading={isLoading}
          onClick={onClick}
          size={"sm"}
          colorScheme={colorScheme}
        >
          {label}
        </Button>
      </Show>
      <Show below="md">
        <IconButton
          isDisabled={isDisabled}
          icon={icon}
          isLoading={isLoading}
          onClick={onClick}
          size={"sm"}
          colorScheme={colorScheme}
        />
      </Show>
    </>
  );
}
