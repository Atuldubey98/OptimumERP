import { ButtonGroup, Flex, Tooltip } from "@chakra-ui/react";
import React from "react";
import { IoAdd } from "react-icons/io5";
import { TbTableExport } from "react-icons/tb";
import { useTranslation } from "react-i18next";
import BackButtonHeader from "./BackButtonHeader";
import ButtonIcon from "./ButtonIcon";

export default function HeadingButtons({
  onAddNewItem,
  heading,
  showExport,
  isAddDisabled,
}) {
  const { t } = useTranslation("common");

  return (
    <Flex justifyContent={"space-between"} alignItems={"center"}>
      <BackButtonHeader heading={heading} />
      <ButtonGroup gap="4">
        {showExport ? (
          <Tooltip label={t("common_ui.actions.export")}>
            <span>
              <ButtonIcon
                isDisabled={isAddDisabled}
                colorScheme="green"
                isLoading={showExport?.status === "exporting"}
                icon={<TbTableExport />}
                label={t("common_ui.actions.export")}
                onClick={showExport?.onExport}
              />
            </span>
          </Tooltip>
        ) : null}
        {onAddNewItem ? (
          <Tooltip
            label={isAddDisabled ? t("common_ui.table.upgrade_your_plan") : ""}
          >
            <span>
              <ButtonIcon
                isDisabled={isAddDisabled}
                icon={<IoAdd />}
                label={t("common_ui.actions.add_new")}
                onClick={onAddNewItem}
              />
            </span>
          </Tooltip>
        ) : null}
      </ButtonGroup>
    </Flex>
  );
}
