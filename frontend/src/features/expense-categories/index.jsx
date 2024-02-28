import { Box, useDisclosure } from "@chakra-ui/react";
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
export default function ExpenseCategoriePage() {
  const { fetchExpenseCategories, expenseCategories, status } =
    useExpenseCategories();
  const { orgId } = useParams();
  const {
    isOpen: isExpenseCategoryFormOpen,
    onOpen: openExpenseCategoryForm,
    onClose: closeExpenseCategoryForm,
  } = useDisclosure();
  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
    },
    onSubmit: async (values) => {
      const { _id, ...category } = values;
      await instance[_id ? "patch" : "post"](
        `/api/v1/organizations/${orgId}/expenses/categories${
          _id ? `/${_id}` : ""
        }`,
        category
      );
      fetchExpenseCategories();
      closeExpenseCategoryForm();
    },
  });
  const onAddNewExpenseCategory = () => {
    formik.setValues({
      name: "",
      description: "",
    });
    openExpenseCategoryForm();
  };
  const { requestAsyncHandler } = useAsyncCall();

  return (
    <MainLayout>
      <Box p={5}>
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
              deleteItem={requestAsyncHandler(async () => {
                await instance.delete(
                  `/api/v1/organizations/${orgId}/expenses/categories/${category._id}`
                );
                fetchExpenseCategories();
              })}
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
        <ExpenseCategoryForm
          formik={formik}
          isOpen={isExpenseCategoryFormOpen}
          onClose={closeExpenseCategoryForm}
        />
      </Box>
    </MainLayout>
  );
}
