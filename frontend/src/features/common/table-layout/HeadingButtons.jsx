import { ButtonGroup, Flex, Tooltip } from "@chakra-ui/react";
import React from "react";
import { IoAdd } from "react-icons/io5";
import { TbTableExport } from "react-icons/tb";
import BackButtonHeader from "./BackButtonHeader";
import ButtonIcon from "./ButtonIcon";

export default function HeadingButtons({
  onAddNewItem,
  heading,
  showExport,
  isAddDisabled,
}) {
  return (
    <Flex justifyContent={"space-between"} alignItems={"center"}>
      <BackButtonHeader heading={heading} />
      <ButtonGroup gap="4">
        {showExport ? (
          <Tooltip label={"Export"}>
            <span>
              <ButtonIcon
                isDisabled={isAddDisabled}
                colorScheme="green"
                isLoading={showExport?.status === "exporting"}
                icon={<TbTableExport />}
                label={"Export"}
                onClick={showExport?.onExport}
              />
            </span>
          </Tooltip>
        ) : null}
        {onAddNewItem ? (
          <Tooltip label={isAddDisabled ? "Upgrade your plan" : ""}>
            <span>
              <ButtonIcon
                isDisabled={isAddDisabled}
                icon={<IoAdd />}
                label={"Add new"}
                onClick={onAddNewItem}
              />
            </span>
          </Tooltip>
        ) : null}
      </ButtonGroup>
    </Flex>
  );
}
