import { Flex, Spinner, useDisclosure } from "@chakra-ui/react";
import React, { useState } from "react";
import useCustomers from "../../hooks/useCustomers";
import MainLayout from "../common/main-layout";
import TableLayout from "../common/table-layout";
import CustomerFormDrawer from "./CustomerFormDrawer";
import CustomerMenu from "./CustomerMenu";
export default function CustomersPage() {
  const {
    isOpen: isOpenCustomerForm,
    onClose: onCloseNewCustomerDrawer,
    onOpen: onOpenNewCustomerDrawer,
  } = useDisclosure();
  const [customer, setCustomer] = useState(null);
  const onSetCustomer = (customerItem) => {
    setCustomer(customerItem);
    onOpenNewCustomerDrawer();
  };
  const onOpenAddNewCustomer = () => {
    setCustomer({
      name: "",
      billingAddress: "",
      gstNo: "",
      panNo: "",
      shippingAddress: "",
    });
    onOpenNewCustomerDrawer();
  };
  const { customers, fetchCustomers, loading } = useCustomers();
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
        operations={customers.map((customer) => (
          <CustomerMenu
            customer={customer}
            key={customer._id}
            onSetCustomer={onSetCustomer}
          />
        ))}
        caption={`Total customers found : ${customers.length}`}
        selectedKeys={{
          name: "Name",
          billingAddress: "Billing address",
          gstNo: "TAX No.",
        }}
        onAddNewItem={onOpenAddNewCustomer}
      />
      <CustomerFormDrawer
        customer={customer}
        isOpen={isOpenCustomerForm}
        onClose={onCloseNewCustomerDrawer}
        onAddedFetch={fetchCustomers}
      />
    </MainLayout>
  );
}
