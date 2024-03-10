import { Box, Flex, Spinner, useDisclosure, useToast } from "@chakra-ui/react";
import useExpenseCategories from "../../hooks/useExpenseCategories";
import MainLayout from "../common/main-layout";
import TableLayout from "../common/table-layout";
import SearchItem from "../common/table-layout/SearchItem";
import { useFormik } from "formik";
import ExpenseCategoryForm from "./ExpenseCategoryForm";
import VertIconMenu from "../common/table-layout/VertIconMenu";
import instance from "../../instance";
import { useParams } from "react-router-dom";
import useAsyncCall from "../../hooks/useAsyncCall";
import AlertModal from "../common/AlertModal";
import { useState } from "react";
import { isAxiosError } from "axios";
export default function ExpenseCategoriePage() {
  const { fetchExpenseCategories, expenseCategories, status } =
    useExpenseCategories();
  const { orgId } = useParams();
  const {
    isOpen: isExpenseCategoryFormOpen,
    onOpen: openExpenseCategoryForm,
    onClose: closeExpenseCategoryForm,
  } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onClose: closeDeleteModal,
    onOpen: openDeleteModal,
  } = useDisclosure();
  const [expenseCategory, setExpenseCategory] = useState(null);
  const onDeleteExpenseCategory = (currentExpenseCategory) => {
    setExpenseCategory(currentExpenseCategory);
    openDeleteModal();
  };
  const loading = status === "loading";
  const [expenseCategoryStatus, setExpenseCategoryStatus] = useState("idle");
  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
    },
    onSubmit: async (values, { setSubmitting }) => {
      const { _id, ...category } = values;
      await instance[_id ? "patch" : "post"](
        `/api/v1/organizations/${orgId}/expenses/categories${
          _id ? `/${_id}` : ""
        }`,
        category
      );
      fetchExpenseCategories();
      closeExpenseCategoryForm();
      setSubmitting(false);
    },
  });
  const onAddNewExpenseCategory = () => {
    formik.setValues({
      name: "",
      description: "",
    });
    openExpenseCategoryForm();
  };
  const toast = useToast();
  const deleteExpenseCategory = async () => {
    try {
      if (!expenseCategory) return;
      setExpenseCategoryStatus("deleting");
      await instance.delete(
        `/api/v1/organizations/${orgId}/expenses/categories/${expenseCategory._id}`
      );
      fetchExpenseCategories();
    } catch (err) {
      toast({
        title: isAxiosError(err) ? err.response?.data?.name : "Error",
        description: isAxiosError(err)
          ? err?.response?.data.message || "Network error occured"
          : "Network error occured",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setExpenseCategoryStatus("idle");
      closeDeleteModal();
    }
  };
  const deleting = expenseCategoryStatus === "deleting";

  return (
    <MainLayout>
      <Box p={5}>
        {loading ? (
          <Flex justifyContent={"center"} alignItems={"center"}>
            <Spinner size={"md"} />
          </Flex>
        ) : (
          <TableLayout
            caption={`Total expense categories : ${expenseCategories.length}`}
            filter={
              <Box>
                <SearchItem />
              </Box>
            }
            onAddNewItem={onAddNewExpenseCategory}
            operations={expenseCategories.map((category) => (
              <VertIconMenu
                deleteItem={() => {
                  onDeleteExpenseCategory(category);
                }}
                editItem={() => {
                  formik.setValues(category);
                  openExpenseCategoryForm();
                }}
              />
            ))}
            heading={"Expense Categories"}
            tableData={expenseCategories}
            selectedKeys={{
              name: "Name",
              description: "Description",
            }}
          />
        )}
        <ExpenseCategoryForm
          formik={formik}
          isOpen={isExpenseCategoryFormOpen}
          onClose={closeExpenseCategoryForm}
        />
        <AlertModal
          confirmDisable={deleting}
          body={"Do you want to delete the expense category ?"}
          header={"Delete"}
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={deleteExpenseCategory}
        />
      </Box>
    </MainLayout>
  );
}
