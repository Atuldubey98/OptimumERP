import { Box, Flex, Spinner, useDisclosure, useToast } from "@chakra-ui/react";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteCustomer } from "../../api/customer";
import useCustomerForm from "../../hooks/useCustomerForm";
import useCustomers from "../../hooks/useCustomers";
import AlertModal from "../common/AlertModal";
import ShowDrawer from "../common/ShowDrawer";
import MainLayout from "../common/main-layout";
import Pagination from "../common/main-layout/Pagination";
import TableLayout from "../common/table-layout";
import SearchItem from "../common/table-layout/SearchItem";
import CustomerFormDrawer from "./CustomerFormDrawer";
import CustomerMenu from "./CustomerMenu";
import { isAxiosError } from "axios";
export default function CustomersPage() {
  const {
    isOpen: isDeleteModalOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure();
  const {
    isOpen: isCustomerFormOpen,
    onClose: onCloseCustomerFormDrawer,
    onOpen: openCustomerFormDrawer,
  } = useDisclosure();
  const {
    isOpen: isCustomerDrawerOpen,
    onClose: closeCustomerDrawer,
    onOpen: openCustomerDrawer,
  } = useDisclosure();
  const {
    customers,
    fetchCustomers,
    loading,
    currentPage,
    totalCustomers,
    totalPages,
  } = useCustomers();
  const { formik: customerFormik } = useCustomerForm(
    fetchCustomers,
    onCloseCustomerFormDrawer
  );
  const [selectedToShowCustomer, setSelectedToShowCustomer] = useState(null);
  const onOpenCustomer = (customer) => {
    setSelectedToShowCustomer(customer);
    openCustomerDrawer();
  };
  const { orgId = "" } = useParams();
  const [status, setStatus] = useState("idle");
  const deleting = status === "deleting";
  const onOpenCustomerToDelete = (customer) => {
    setSelectedToShowCustomer(customer);
    openDeleteModal();
  };
  const toast = useToast();
  const onDeleteCustomer = async () => {
    try {
      setStatus("deleting");
      await deleteCustomer(selectedToShowCustomer._id, orgId);
      fetchCustomers();
      setStatus("idle");
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
      setStatus("idle");
      closeDeleteModal();
    }
  };
  const onCloseCustomer = () => {
    closeCustomerDrawer();
    setSelectedToShowCustomer(null);
  };
  const onOpenDrawerForAddingNewCustomer = () => {
    customerFormik.setValues({
      name: "",
      billingAddress: "",
      gstNo: "",
      panNo: "",
      shippingAddress: "",
    });
    openCustomerFormDrawer();
  };
  const onOpenDrawerForEditingCustomer = (customer) => {
    customerFormik.setValues(customer);
    openCustomerFormDrawer();
  };
  const navigate = useNavigate();
  return (
    <MainLayout>
      <Box p={5}>
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
            heading={"Customers"}
            tableData={customers}
            caption={`Total customers found : ${totalCustomers}`}
            operations={customers.map((customer) => (
              <CustomerMenu
                onOpenTransactionsForCustomer={() => {
                  navigate(`/${orgId}/customers/${customer._id}/transactions`);
                }}
                onDeleteCustomer={onOpenCustomerToDelete}
                customer={customer}
                key={customer._id}
                onOpenDrawerForEditingCustomer={onOpenDrawerForEditingCustomer}
                onOpenCustomer={onOpenCustomer}
              />
            ))}
            selectedKeys={{
              name: "Name",
              billingAddress: "Billing address",
              gstNo: "TAX No.",
            }}
            onAddNewItem={onOpenDrawerForAddingNewCustomer}
          />
        )}
        <AlertModal
          confirmDisable={deleting}
          body={"Do you want to delete the customer ?"}
          header={"Delete customer"}
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={onDeleteCustomer}
        />
        <CustomerFormDrawer
          formik={customerFormik}
          isOpen={isCustomerFormOpen}
          onClose={onCloseCustomerFormDrawer}
        />
        {selectedToShowCustomer ? (
          <ShowDrawer
            onClickNewItem={onOpenDrawerForAddingNewCustomer}
            heading={"Customer"}
            formBtnLabel={"Create New"}
            isOpen={isCustomerDrawerOpen}
            item={selectedToShowCustomer}
            onClose={onCloseCustomer}
            selectedKeys={{
              name: "Name",
              shippingAddress: "Shipping address",
              billingAddress: "Billing address",
              gstNo: "GST No",
              panNo: "PAN No",
            }}
          />
        ) : null}
        {loading ? null : (
          <Pagination currentPage={currentPage} total={totalPages} />
        )}
      </Box>
    </MainLayout>
  );
}
