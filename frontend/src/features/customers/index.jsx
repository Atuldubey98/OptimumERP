import { Flex, Spinner, useDisclosure } from "@chakra-ui/react";
import React, { useState } from "react";
import useCustomerForm from "../../hooks/useCustomerForm";
import useCustomers from "../../hooks/useCustomers";
import MainLayout from "../common/main-layout";
import TableLayout from "../common/table-layout";
import CustomerFormDrawer from "./CustomerFormDrawer";
import CustomerMenu from "./CustomerMenu";
import ShowDrawer from "../common/ShowDrawer";
import useAsyncCall from "../../hooks/useAsyncCall";
import { deleteCustomer } from "../../api/customer";
import { useParams } from "react-router-dom";
import ProductFormDrawer from "../products/ProductFormDrawer";
export default function CustomersPage() {
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
  const { customers, fetchCustomers, loading } = useCustomers();
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
  const { requestAsyncHandler } = useAsyncCall();
  const onDeleteCustomer = requestAsyncHandler(async (customer) => {
    await deleteCustomer(customer._id, orgId);
    fetchCustomers();
  });
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
  return (
    <MainLayout>
      {loading ? (
        <Flex justifyContent={"center"} alignItems={"center"}>
          <Spinner size={"md"} />
        </Flex>
      ) : null}
      <TableLayout
        heading={"Customers list"}
        tableData={customers}
        caption={`Total customers found : ${customers.length}`}
        operations={customers.map((customer) => (
          <CustomerMenu
            onDeleteCustomer={onDeleteCustomer}
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
    </MainLayout>
  );
}
