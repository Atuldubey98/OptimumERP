import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  Textarea,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import useAsyncCall from "../../hooks/useAsyncCall";
import FormDrawerLayout from "../common/form-drawer-layout";
import instance from "../../instance";
import { useParams } from "react-router-dom";
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
  return (
    <FormDrawerLayout
      isSubmitting={formik.isSubmitting}
      formBtnLabel={formik.values._id ? "Update" : "Add"}
      formHeading={"Expense"}
      handleFormSubmit={formik.handleSubmit}
      isOpen={isOpen}
      onClose={onClose}
    >
      <FormControl
        isInvalid={formik.errors.amount && formik.touched.amount}
        isRequired
      >
        <FormLabel>Amount</FormLabel>
        <Input
          type="number"
          value={formik.values.amount}
          name="amount"
          onChange={formik.handleChange}
        />
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
            onChange={formik.handleChange}
            name="category"
            value={formik.values.category}
          >
            <option value="">Select any category</option>
            {expenseCategories.map((expenseCategory) => (
              <option value={expenseCategory._id} key={expenseCategory._id}>
                {expenseCategory.name}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{formik.errors.category}</FormErrorMessage>
        </FormControl>
      )}
      <FormControl
        isInvalid={
          formik.errors.date && formik.touched.date
        }
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
    </FormDrawerLayout>
  );
}
