import {
  Box,
  Flex,
  Spinner,
  Switch,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { isAxiosError } from "axios";
import { useFormik } from "formik";
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useExpenseCategories from "../../hooks/useExpenseCategories";
import instance from "../../instance";
import AlertModal from "../common/AlertModal";
import TableLayout from "../common/table-layout";
import SearchItem from "../common/table-layout/SearchItem";
import VertIconMenu from "../common/table-layout/VertIconMenu";
import ExpenseCategoryForm from "./ExpenseCategoryForm";
import * as Yup from "yup";
import { GiExpense } from "react-icons/gi";

import useAsyncCall from "../../hooks/useAsyncCall";
import useLimitsInFreePlan from "../../hooks/useLimitsInFreePlan";
const expenseCategorySchema = Yup.object({
  name: Yup.string().required().max(80, "Cannot be greater than 80 characters"),
  enabled: Yup.boolean().optional().default(true),
  description: Yup.string()
    .optional()
    .max(150, "Cannot be greater than 150 characters"),
});
export default function ExpenseCategories() {
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
  const { requestAsyncHandler } = useAsyncCall();
  const [expenseCategoryStatus, setExpenseCategoryStatus] = useState("idle");
  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      enabled: true,
    },
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { _id, ...category } = values;
      await instance[_id ? "patch" : "post"](
        `/api/v1/organizations/${orgId}/expenses/categories${
          _id ? `/${_id}` : ""
        }`,
        category
      );
      fetchExpenseCategories();
      toast({
        title: "Success",
        size: "sm",
        description: `Expense category ${_id ? "updated" : "created"}`,
        status: _id ? "info" : "success",
        duration: 3000,
        isClosable: true,
      });
      closeExpenseCategoryForm();
      setSubmitting(false);
    }),
    validationSchema: expenseCategorySchema,
    validateOnChange: false,
  });
  const onAddNewExpenseCategory = () => {
    formik.setValues({
      name: "",
      description: "",
      enabled: true,
    });
    formik.setTouched({
      name: false,
      description: false,
      enabled: false,
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
      toast({
        title: "Success",
        description: "Expense category deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
  const navigate = useNavigate();
  const { disable } = useLimitsInFreePlan({ key: "expenseCategories" });

  return (
    <Box p={1}>
      {loading ? (
        <Flex justifyContent={"center"} alignItems={"center"}>
          <Spinner size={"md"} />
        </Flex>
      ) : (
        <TableLayout
          isAddDisabled={disable}
          caption={`Total expense categories : ${expenseCategories.length}`}
          filter={
            <Box maxW={"md"}>
              <SearchItem />
            </Box>
          }
          limitKey={"expenseCategories"}
          onAddNewItem={onAddNewExpenseCategory}
          operations={expenseCategories.map((category) => (
            <VertIconMenu
              showExpenses={() => {
                navigate(`${category._id}/expenses`);
              }}
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
          tableData={expenseCategories.map((item) => ({
            ...item,
            enabled: (
              <Switch
                isChecked={item.enabled}
                onChange={async () => {
                  const { _id, ...expenseCategory } = item;
                  await instance.patch(
                    `/api/v1/organizations/${orgId}/expenses/categories/${_id}`,
                    { ...expenseCategory, enabled: !item.enabled }
                  );
                  fetchExpenseCategories();
                }}
              />
            ),
          }))}
          selectedKeys={{
            name: "Name",
            description: "Description",
            enabled: "Enabled",
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
  );
}
