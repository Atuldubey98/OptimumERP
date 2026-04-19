import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Spinner,
  Switch,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import useSetting from "../../hooks/useCurrentOrgCurrency";
import useTaxes from "../../hooks/useTaxes";
import instance from "../../instance";
import AlertModal from "../common/AlertModal";
import MainLayout from "../common/main-layout";
import ShowDrawer from "../common/ShowDrawer";
import TableLayout from "../common/table-layout";
import SearchItem from "../common/table-layout/SearchItem";
import VertIconMenu from "../common/table-layout/VertIconMenu";
import EditTaxModal from "./EditTaxModal";
import DefaultSwitchSetting from "./DefaultSwitchSetting";
import SettingContext from "../../contexts/SettingContext";
import { useTranslation } from "react-i18next";
export default function TaxesPage() {
  const { t } = useTranslation("tax");
  const { status, taxes, getAll, onToggleEnabled, hasReachedLimit } =
    useTaxes();
  const { receiptDefaults } = useSetting();
  const [selectedTax, setSelectedTax] = useState(null);
  const [selectedTaxStatus, setSelectedTaxStatus] = useState("idle");
  const { isOpen: isAddNewTaxOpen, onToggle: toggleTaxOpen } = useDisclosure();
  const { isOpen: isTaxModalOpen, onToggle: toggleTaxModal } = useDisclosure();
  const { isOpen: isAlertOpen, onToggle: toggleAlert } = useDisclosure();
  const settingContext = useContext(SettingContext);
  const role = settingContext?.role || "";
  const { orgId } = useParams();
  const toast = useToast();

  const onConfirmDelete = async () => {
    try {
      if (!selectedTax) return;
      setSelectedTaxStatus("deleting");
      const { data } = await instance.delete(
        `/api/v1/organizations/${orgId}/taxes/${selectedTax._id}`,
      );
      setSelectedTaxStatus("idle");
      toast({
        title: t("tax_ui.toast.success_title"),
        description: data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      getAll();
    } catch (error) {
      toast({
        title: t("tax_ui.toast.error_title"),
        description:
          error?.response?.data?.message || t("tax_ui.toast.error_fallback"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSelectedTaxStatus("idle");
      setSelectedTax(null);
      toggleAlert();
    }
  };
  const makeTaxesDisplayMapper = (tax) => ({
    ...tax,
    percentage: `${tax.percentage}%`,
    enabled: (
      <Switch
        isChecked={tax.enabled}
        onChange={async () => {
          await onToggleEnabled(tax);
        }}
      />
    ),
    category:
      tax.type === "single"
        ? tax.category.toUpperCase()
        : `${tax.children
            .map((taxChild) => taxChild.category.toUpperCase())
            .join(", ")}`,
  });

  const isAddDisabled = hasReachedLimit;
  return (
    <>
      <Box p={4}>
        {status === "loading" ? (
          <Flex justifyContent={"center"} alignItems={"center"}>
            <Spinner />
          </Flex>
        ) : (
          <TableLayout
            isAddDisabled={isAddDisabled}
            caption={t("tax_ui.page.total", { count: taxes.length })}
            onAddNewItem={toggleTaxOpen}
            filter={
              <Box maxW={"md"}>
                <SearchItem />
              </Box>
            }
            heading={t("tax_ui.page.heading")}
            selectedKeys={{
              name: t("tax_ui.table.columns.name"),
              category: t("tax_ui.table.columns.category"),
              percentage: t("tax_ui.table.columns.percentage"),
              enabled: t("tax_ui.table.columns.enabled"),
            }}
            tableData={taxes.map(makeTaxesDisplayMapper)}
            operations={taxes.map((tax) => (
              <VertIconMenu
                deleteItem={
                  tax._id === receiptDefaults?.tax
                    ? null
                    : () => {
                        setSelectedTax(tax);
                        toggleAlert();
                      }
                }
                showItem={() => {
                  setSelectedTax(tax);
                  toggleTaxModal();
                }}
              />
            ))}
          />
        )}
      </Box>
      <EditTaxModal
        isOpen={isAddNewTaxOpen}
        onClose={toggleTaxOpen}
        taxes={taxes}
        fetchTaxes={getAll}
      />
      {selectedTax ? (
        <AlertModal
          body={t("tax_ui.modal.delete_body")}
          header={t("tax_ui.modal.delete_header")}
          buttonLabel={t("tax_ui.modal.delete_button")}
          confirmDisable={selectedTaxStatus === "deleting"}
          isOpen={isAlertOpen}
          onClose={toggleAlert}
          onConfirm={onConfirmDelete}
        />
      ) : null}
      {selectedTax ? (
        <ShowDrawer
          disable={isAddDisabled}
          formBtnLabel={t("tax_ui.modal.show_add_button")}
          heading={t("tax_ui.modal.show_heading")}
          isOpen={isTaxModalOpen}
          item={{
            ...selectedTax,
            percentage: `${selectedTax.percentage}%`,
            category:
              selectedTax.type === "single"
                ? selectedTax.category.toUpperCase()
                : `${selectedTax.children
                    .map((taxChild) => taxChild.category.toUpperCase())
                    .join(", ")}`,
          }}
          onClickNewItem={toggleTaxOpen}
          onClose={toggleTaxModal}
          selectedKeys={{
            name: t("tax_ui.table.columns.name"),
            type: t("tax_ui.table.columns.type"),
            category: t("tax_ui.table.columns.category"),
            percentage: t("tax_ui.table.columns.percentage"),
            description: t("tax_ui.table.columns.description"),
          }}
        >
          {role === "admin" ? (
            <DefaultSwitchSetting
              receiptDefaultKey={"tax"}
              selectedItem={selectedTax}
              successMessage={t("tax_ui.toast.default_updated")}
            />
          ) : null}
        </ShowDrawer>
      ) : null}
    </>
  );
}
