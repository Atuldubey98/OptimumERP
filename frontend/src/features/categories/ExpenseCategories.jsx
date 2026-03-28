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
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import useExpenseCategories from "../../hooks/useExpenseCategories";
import instance from "../../instance";
import AlertModal from "../common/AlertModal";
import TableLayout from "../common/table-layout";
import SearchItem from "../common/table-layout/SearchItem";
import VertIconMenu from "../common/table-layout/VertIconMenu";
import ExpenseCategoryForm from "./ExpenseCategoryForm";

import useAsyncCall from "../../hooks/useAsyncCall";

const createExpenseCategorySchema = (t) =>
  Yup.object({
    name: Yup.string()
      .required(t("validation.name_required"))
      .max(80, t("validation.max_80")),
    enabled: Yup.boolean().optional().default(true),
    description: Yup.string().optional().max(150, t("validation.max_150")),
  });

export default function ExpenseCategories() {
  const { t } = useTranslation("categories");
  const {
    fetchExpenseCategories,
    expenseCategories,
    status,
    onSetExpenseCategories,
    reachedLimit,
  } = useExpenseCategories();
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
        `/api/v1/organizations/${orgId}/expenseCategories${
          _id ? `/${_id}` : ""
        }`,
        category
      );
      fetchExpenseCategories();
      toast({
        title: t("toasts.success_title"),
        size: "sm",
        description: _id
          ? t("toasts.expense_category_updated")
          : t("toasts.expense_category_created"),
        status: _id ? "info" : "success",
        duration: 3000,
        isClosable: true,
      });
      closeExpenseCategoryForm();
      setSubmitting(false);
    }),
    validationSchema: createExpenseCategorySchema(t),
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
        `/api/v1/organizations/${orgId}/expenseCategories/${expenseCategory._id}`
      );
      toast({
        title: t("toasts.success_title"),
        description: t("toasts.expense_category_deleted"),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchExpenseCategories();
    } catch (err) {
      toast({
        title: isAxiosError(err)
          ? err.response?.data?.name
          : t("toasts.error_title"),
        description: isAxiosError(err)
          ? err?.response?.data.message || t("toasts.network_error")
          : t("toasts.network_error"),
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

  return (
    <Box p={1}>
      {loading ? (
        <Flex justifyContent={"center"} alignItems={"center"}>
          <Spinner size={"md"} />
        </Flex>
      ) : (
        <TableLayout
          isAddDisabled={reachedLimit}
          caption={t("expense.total_count", {
            count: expenseCategories.length,
          })}
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
          heading={t("expense.heading")}
          tableData={expenseCategories.map((item) => ({
            ...item,
            enabled: (
              <Switch
                isChecked={item.enabled}
                onChange={async () => {
                  const { _id, ...expenseCategory } = item;
                  onSetExpenseCategories(
                    expenseCategories.map((expenseCategory) =>
                      expenseCategory._id === _id
                        ? {
                            ...expenseCategory,
                            enabled: !expenseCategory.enabled,
                          }
                        : expenseCategory
                    )
                  );
                  await instance.patch(
                    `/api/v1/organizations/${orgId}/expenseCategories/${_id}`,
                    { ...expenseCategory, enabled: !item.enabled }
                  );
                }}
              />
            ),
          }))}
          selectedKeys={{
            name: t("fields.name"),
            description: t("fields.description"),
            enabled: t("fields.enabled"),
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
        body={t("expense.delete_body")}
        header={t("actions.delete")}
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={deleteExpenseCategory}
      />
    </Box>
  );
}
