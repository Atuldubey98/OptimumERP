import MainLayout from "../common/main-layout";
import usePaginatedFetch from "../../hooks/usePaginatedFetch";
import { useParams } from "react-router-dom";
import { Box, useDisclosure } from "@chakra-ui/react";
import TableLayout from "../common/table-layout";
import SearchItem from "../common/table-layout/SearchItem";
import VertIconMenu from "../common/table-layout/VertIconMenu";
import ExpenseForm from "./ExpenseForm";
import { useFormik } from "formik";
import instance from "../../instance";
import Pagination from "../common/main-layout/Pagination";
import { useState } from "react";
import ShowDrawer from "../common/ShowDrawer";
import useAsyncCall from "../../hooks/useAsyncCall";
export default function ExpensesPage() {
  const { requestAsyncHandler } = useAsyncCall();
  const { orgId } = useParams();
  const { data, status, fetchFn } = usePaginatedFetch({
    url: `/api/v1/organizations/${orgId}/expenses`,
  });
  const { items: expenses, totalPages, currentPage, totalCount } = data;
  const loading = status === "loading";
  const {
    isOpen: isExpenseFormOpen,
    onOpen: openExpenseForm,
    onClose: closeExpenseForm,
  } = useDisclosure();
  const {
    isOpen: isExpenseOpen,
    onOpen: openExpense,
    onClose: closeExpense,
  } = useDisclosure();
  const [expenseSelected, setExpenseSelected] = useState(null);
  const formik = useFormik({
    initialValues: {
      description: "",
      amount: 0,
      category: "",
      date: new Date().toISOString().split("T")[0],
    },

    onSubmit: async (values) => {
      const { _id, ...expense } = values;
      await instance[_id ? "patch" : "post"](
        `/api/v1/organizations/${orgId}/expenses${_id ? `/${_id}` : ``}`,
        { ...expense, category: expense.category || null }
      );
      fetchFn();
      closeExpenseForm();
    },
  });
  const onAddNewExpense = () => {
    formik.setValues({
      amount: 0,
      category: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
    openExpenseForm();
  };
  return (
    <MainLayout>
      <Box p={5}>
        <TableLayout
          onAddNewItem={onAddNewExpense}
          filter={
            <Box maxW={"md"}>
              <SearchItem />
            </Box>
          }
          heading={"Expenses"}
          tableData={expenses.map((expense) => ({
            ...expense,
            category: expense.category ? expense.category.name : "Miscellenous",
            date: new Date(expense.date).toISOString().split("T")[0],
          }))}
          caption={`Total expenses found : ${totalCount}`}
          operations={expenses.map((expense) => (
            <VertIconMenu
              editItem={() => {
                formik.setValues({
                  _id: expense._id,
                  description: expense.description,
                  amount: expense.amount,
                  category: expense.category ? expense.category._id : "",
                  date: new Date(expense.date).toISOString().split("T")[0],
                });
                openExpenseForm();
              }}
              showItem={() => {
                setExpenseSelected(expense);
                openExpense();
              }}
              deleteItem={requestAsyncHandler(async () => {
                await instance.delete(
                  `/api/v1/organizations/${orgId}/expenses/${expense._id}`
                );
                fetchFn();
              })}
            />
          ))}
          selectedKeys={{
            date: "Date",
            category: "Category",
            description: "Description",
          }}
        />
        <ExpenseForm
          isOpen={isExpenseFormOpen}
          formik={formik}
          onClose={closeExpenseForm}
        />
        <Pagination currentPage={currentPage} total={totalPages} />
        {expenseSelected ? (
          <ShowDrawer
            onClickNewItem={onAddNewExpense}
            heading={"Expense"}
            formBtnLabel={"Create New"}
            isOpen={isExpenseOpen}
            item={{
              ...expenseSelected,
              category: expenseSelected.category
                ? expenseSelected.category.name
                : "Miscellenous",
            }}
            onClose={closeExpense}
            selectedKeys={{
              date: "Date",
              category: "Category",
              description: "Description",
            }}
          />
        ) : null}
      </Box>
    </MainLayout>
  );
}
