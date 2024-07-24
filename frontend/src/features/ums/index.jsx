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

export default function UmsPage() {
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
            caption={`Total Unit of measurements ${ums.length}`}
            onAddNewItem={toggleUmEditModal}
            filter={
              <Box maxW={"md"}>
                <SearchItem />
              </Box>
            }
            heading={"Unit of measurements"}
            selectedKeys={{
              name: "Name",
              unit: "Unit",
              enabled: "Enabled",
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
          formBtnLabel={"Add new"}
          selectedKeys={{
            name: "Name",
            unit: "Unit",
            enabled: "Enabled",
            description: "Description",
          }}
          heading={"Unit of measurement"}
          isOpen={isUmOpen}
          onClose={toggleUmShow}
          item={{ ...selectedUm, enabled: selectedUm.enabled ? "YES" : "NO" }}
          onClickNewItem={toggleUmEditModal}
        >
          <DefaultSwitchSetting
            receiptDefaultKey={"um"}
            selectedItem={selectedUm}
            successMessage={"Default unit updated"}
          />
        </ShowDrawer>
      ) : null}
    </MainLayout>
  );
}
