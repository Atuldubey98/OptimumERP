import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import useAsyncCall from "../../hooks/useAsyncCall";
import FormDrawerLayout from "../common/form-drawer-layout";
import instance from "../../instance";
import { Select } from "chakra-react-select";
import { useParams } from "react-router-dom";
import NumberInputInteger from "../common/NumberInputInteger";
export default function ExpenseForm({ formik, isOpen, onClose }) {
  const { requestAsyncHandler } = useAsyncCall();
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [status, setStatus] = useState("idle");
  const { orgId } = useParams();
  const fetchExpenseCategories = useCallback(
    requestAsyncHandler(async () => {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/expenses/categories`
      );
      setExpenseCategories(data.data);
      setStatus("success");
    }),
    []
  );
  useEffect(() => {
    fetchExpenseCategories();
  }, []);
  const expenseCategoryOptions = expenseCategories.map((expenseCategory) => ({
    value: expenseCategory._id,
    label: expenseCategory.name,
  }));
  return (
    <FormDrawerLayout
      isSubmitting={formik.isSubmitting}
      formBtnLabel={formik.values._id ? "Update" : "Add"}
      formHeading={"Expense"}
      handleFormSubmit={formik.handleSubmit}
      isOpen={isOpen}
      onClose={onClose}
    >
      <Stack spacing={1}>
        <FormControl
          isInvalid={formik.errors.amount && formik.touched.amount}
          isRequired
        >
          <FormLabel>Amount</FormLabel>
          <NumberInputInteger formik={formik} name={"amount"} />
          <FormErrorMessage>{formik.errors.amount}</FormErrorMessage>
        </FormControl>
        <FormControl
          isInvalid={formik.errors.description && formik.touched.description}
          isRequired
        >
          <FormLabel>Description</FormLabel>
          <Textarea
            value={formik.values.description}
            name="description"
            onChange={formik.handleChange}
          />
          <FormErrorMessage>{formik.errors.description}</FormErrorMessage>
        </FormControl>
        {status === "loading" ? null : (
          <FormControl
            isInvalid={formik.errors.category && formik.touched.category}
          >
            <FormLabel>Expense Category</FormLabel>
            <Select
              isClearable
              onChange={(option) => {
                formik.setFieldValue(
                  "category",
                  option ? option.value : undefined
                );
              }}
              options={expenseCategoryOptions}
              name="category"
              value={expenseCategoryOptions.find(
                (expenseCategory) =>
                  expenseCategory.value == formik.values.category
              )}
            />
            <FormErrorMessage>{formik.errors.category}</FormErrorMessage>
          </FormControl>
        )}
        {formik.values.category ? null : (
          <Text fontSize={"sm"}>
            Note : Expense without category will be counted as Miscellenous
          </Text>
        )}
        <FormControl
          isInvalid={formik.errors.date && formik.touched.date}
          isRequired
        >
          <FormLabel>Date</FormLabel>
          <Input
            name="date"
            type="date"
            onChange={formik.handleChange}
            value={formik.values.date}
          />
          <FormErrorMessage>{formik.errors.date}</FormErrorMessage>
        </FormControl>
      </Stack>
    </FormDrawerLayout>
  );
}
