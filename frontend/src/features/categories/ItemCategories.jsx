import {
  Box,
  Flex,
  Spinner,
  Switch,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { isAxiosError } from "axios";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useItemCategoryForm from "../../hooks/useItemCategoryForm";
import usePaginatedFetch from "../../hooks/usePaginatedFetch";
import instance from "../../instance";
import AlertModal from "../common/AlertModal";
import Pagination from "../common/main-layout/Pagination";
import TableLayout from "../common/table-layout";
import SearchItem from "../common/table-layout/SearchItem";
import VertIconMenu from "../common/table-layout/VertIconMenu";
import ItemCategoryForm from "./ItemCategoryForm";

export default function ItemCategories() {
  const { t } = useTranslation("categories");
  const { orgId } = useParams();
  const { data, status, fetchFn, onSetItems } = usePaginatedFetch({
    url: `/api/v1/organizations/${orgId}/productCategories`,
  });
  const loading = status === "loading";
  const {
    isOpen: isItemCategoryFormOpen,
    onOpen: openItemCategoryForm,
    onClose: closeItemCategoryForm,
  } = useDisclosure();
  const { formik } = useItemCategoryForm({
    fetchItemCategories: fetchFn,
    closeDrawer: closeItemCategoryForm,
  });
  const {
    isOpen: isItemCategoryDeleteModal,
    onOpen: openItemCategoryDeleteModal,
    onClose: closeItemCategoryDeleteModal,
  } = useDisclosure();
  const [categoryStatus, setCategoryStatus] = useState("idle");
  const [selectedItemCategory, setSelectedItemCategory] = useState(null);
  const toast = useToast();
  const deleting = categoryStatus === "deleting";

  const deleteProductCategory = useCallback(async () => {
    try {
      if (!selectedItemCategory) return;
      setCategoryStatus("deleting");
      await instance.delete(
        `/api/v1/organizations/${orgId}/productCategories/${selectedItemCategory._id}`
      );
      toast({
        title: t("toasts.success_title"),
        description: t("toasts.item_category_deleted"),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      closeItemCategoryDeleteModal();
      fetchFn();
    } catch (error) {
      toast({
        title: t("toasts.error_title"),
        description: isAxiosError(error)
          ? error.response.data.message || t("toasts.some_error_occurred")
          : t("toasts.some_error_occurred"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCategoryStatus("idle");
    }
  }, [selectedItemCategory, t, closeItemCategoryDeleteModal, fetchFn, orgId, toast]);
  const selectAndOpenDeleteCategoryModal = (itemCategory) => {
    setSelectedItemCategory(itemCategory);
    openItemCategoryDeleteModal();
  };
  const navigate = useNavigate();

  const location = useLocation();
  return (
    <Box p={1}>
      {loading ? (
        <Flex justifyContent={"center"} alignItems={"center"}>
          <Spinner size={"md"} />
        </Flex>
      ) : (
        <TableLayout
          isAddDisabled={data.reachedLimit}
          filter={
            <Box maxW={"md"}>
              <SearchItem />
            </Box>
          }
          limitKey={"productCategories"}
          caption={t("item.total_count", { count: data.totalCount })}
          tableData={data.items.map((item) => ({
            ...item,

            enabled: (
              <Switch
                isChecked={item.enabled}
                onChange={async () => {
                  const { _id, ...productCategory } = item;
                  const toggleEnable = data.items.map((productCategoryItem) =>
                    productCategoryItem._id === _id
                      ? {
                          ...productCategoryItem,
                          enabled: !productCategoryItem.enabled,
                        }
                      : productCategoryItem
                  );
                  onSetItems(toggleEnable);
                  await instance.patch(
                    `/api/v1/organizations/${orgId}/productCategories/${_id}`,
                    { ...productCategory, enabled: !item.enabled }
                  );
                }}
              />
            ),
          }))}
          operations={data.items.map((itemType) => (
            <VertIconMenu
              showProducts={() =>
                navigate(location.pathname + `/${itemType._id}/products`)
              }
              key={itemType._id}
              editItem={() => {
                formik.setValues(itemType);
                openItemCategoryForm();
              }}
              deleteItem={() => {
                selectAndOpenDeleteCategoryModal(itemType);
              }}
            />
          ))}
          onAddNewItem={() => {
            formik.resetForm();
            openItemCategoryForm();
          }}
          selectedKeys={{
            name: t("fields.name"),
            description: t("fields.description"),
            enabled: t("fields.enabled"),
          }}
          heading={t("item.heading")}
        />
      )}
      {loading ? null : (
        <Pagination currentPage={data.currentPage} total={data.totalPages} />
      )}
      <ItemCategoryForm
        formik={formik}
        isOpen={isItemCategoryFormOpen}
        onClose={closeItemCategoryForm}
      />
      <AlertModal
        confirmDisable={deleting}
        body={t("item.delete_body")}
        header={t("item.delete_header")}
        isOpen={isItemCategoryDeleteModal}
        onClose={closeItemCategoryDeleteModal}
        onConfirm={deleteProductCategory}
      />
    </Box>
  );
}
