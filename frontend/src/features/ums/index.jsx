import { Box, Flex, Spinner, Switch, useDisclosure } from "@chakra-ui/react";
import React, { useState } from "react";
import useUms from "../../hooks/useUms";
import MainLayout from "../common/main-layout";
import TableLayout from "../common/table-layout";
import SearchItem from "../common/table-layout/SearchItem";
import VertIconMenu from "../common/table-layout/VertIconMenu";
import EditUmModal from "./EditUmModal";
import ShowDrawer from "../common/ShowDrawer";
import DefaultSwitchSetting from "../taxes/DefaultSwitchSetting";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import { useTranslation } from "react-i18next";

export default function UmsPage() {
  const { t } = useTranslation("um");
  const { ums, status, toggleStatus, fetchUms, onDeleteUm, hasReachedLimit } =
    useUms();
  const { receiptDefaults } = useCurrentOrgCurrency();
  const [selectedUm, setSelectedUm] = useState(null);
  const { isOpen: isUmEditModalOpen, onToggle: toggleUmEditModal } =
    useDisclosure();
  const { isOpen: isUmOpen, onToggle: toggleUmShow } = useDisclosure();

  const umDisplayMapper = (um) => ({
    ...um,
    enabled: (
      <Switch
        isChecked={um.enabled}
        onChange={async () => {
          await toggleStatus(um);
        }}
      />
    ),
  });
  return (
    <MainLayout>
      <Box p={4}>
        {status === "loading" ? (
          <Flex justifyContent={"center"} alignItems={"center"}>
            <Spinner />
          </Flex>
        ) : (
          <TableLayout
            isAddDisabled={hasReachedLimit}
            caption={t("um_ui.page.total", { count: ums.length })}
            onAddNewItem={toggleUmEditModal}
            filter={
              <Box maxW={"md"}>
                <SearchItem />
              </Box>
            }
            heading={t("um_ui.page.heading")}
            selectedKeys={{
              name: t("um_ui.table.columns.name"),
              unit: t("um_ui.table.columns.unit"),
              enabled: t("um_ui.table.columns.enabled"),
            }}
            tableData={ums.map(umDisplayMapper)}
            operations={ums.map((um) => (
              <VertIconMenu
                deleteItem={
                  receiptDefaults?.um === um._id ? null : onDeleteUm(um)
                }
                showItem={() => {
                  setSelectedUm(um);
                  toggleUmShow();
                }}
              />
            ))}
          />
        )}
      </Box>
      <EditUmModal
        fetchUms={fetchUms}
        isOpen={isUmEditModalOpen}
        onClose={toggleUmEditModal}
      />
      {selectedUm ? (
        <ShowDrawer
          disable={hasReachedLimit}
          formBtnLabel={t("um_ui.modal.add_new")}
          selectedKeys={{
            name: t("um_ui.table.columns.name"),
            unit: t("um_ui.table.columns.unit"),
            enabled: t("um_ui.table.columns.enabled"),
            description: t("um_ui.table.columns.description"),
          }}
          heading={t("um_ui.page.heading_single")}
          isOpen={isUmOpen}
          onClose={toggleUmShow}
          item={{ ...selectedUm, enabled: selectedUm.enabled ? "YES" : "NO" }}
          onClickNewItem={toggleUmEditModal}
        >
          <DefaultSwitchSetting
            receiptDefaultKey={"um"}
            selectedItem={selectedUm}
            successMessage={t("um_ui.toast.default_updated")}
          />
        </ShowDrawer>
      ) : null}
    </MainLayout>
  );
}
