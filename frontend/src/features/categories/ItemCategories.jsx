import { Box, Flex, Spinner, useDisclosure, useToast } from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import usePaginatedFetch from "../../hooks/usePaginatedFetch";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TableLayout from "../common/table-layout";
import ItemCategoryForm from "./ItemCategoryForm";
import useItemCategoryForm from "../../hooks/useItemCategoryForm";
import Pagination from "../common/main-layout/Pagination";
import VertIconMenu from "../common/table-layout/VertIconMenu";
import AlertModal from "../common/AlertModal";
import instance from "../../instance";
import { isAxiosError } from "axios";
import SearchItem from "../common/table-layout/SearchItem";

export default function ItemCategories() {
  const { orgId } = useParams();
  const { data, status, fetchFn } = usePaginatedFetch({
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
        title: "Success",
        description: "Item category deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      closeItemCategoryDeleteModal();
      fetchFn();
    } catch (error) {
      toast({
        title: "Error",
        description: isAxiosError(error)
          ? error.response.data.message || "Some error occured"
          : "Some error occured",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCategoryStatus("idle");
    }
  }, [selectedItemCategory]);
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
          filter={
            <Box maxW={"md"}>
              <SearchItem />
            </Box>
          }
          caption={`Total item types : ${data.totalCount}`}
          tableData={data.items}
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
            name: "Name",
            description: "Description",
          }}
          heading={"Product Categories"}
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
        body={"Do you want to delete the item category ?"}
        header={"Delete category"}
        isOpen={isItemCategoryDeleteModal}
        onClose={closeItemCategoryDeleteModal}
        onConfirm={deleteProductCategory}
      />
    </Box>
  );
}
