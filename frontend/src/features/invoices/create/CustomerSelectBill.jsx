import React from "react";
import CustomerFormDrawer from "../../customers/CustomerFormDrawer";
import { useDisclosure } from "@chakra-ui/react";
import useCustomerForm from "../../../hooks/useCustomerForm";
import AsyncCreatableSelect from "react-select/async-creatable";
import instance from "../../../instance";
import { useParams } from "react-router-dom";

export default function CustomerSelectBill({ formik }) {
  const { orgId } = useParams();
  const promiseOptions = async (searchQuery) => {
    const { data } = await instance.get(
      `/api/v1/organizations/${orgId}/customers/search`,
      {
        params: {
          keyword: searchQuery,
        },
      }
    );
    return data.data.map((customer) => ({
      value: customer,
      label: customer.name,
    }));
  };
  const {
    isOpen: isCustomerFormOpen,
    onClose: onCloseCustomerFormDrawer,
    onOpen: openCustomerFormDrawer,
  } = useDisclosure();
  const { formik: customerFormik } = useCustomerForm(
    promiseOptions,
    onCloseCustomerFormDrawer
  );
  return (
    <>
      <AsyncCreatableSelect
        value={
          formik.values.customerDetails && {
            value: formik.values?.customerDetails,
            label: formik.values?.customerDetails?.name,
          }
        }
        createOptionPosition="first"
        onChange={({ value: customer }) => {
          formik.setFieldValue("customer", customer._id);
          formik.setFieldValue("billingAddress", customer.billingAddress);
          formik.setFieldValue("customerDetails", customer);
        }}
        isClearable
        onCreateOption={(input) => {
          customerFormik.setFieldValue("name", input);
          openCustomerFormDrawer();
        }}
        loadOptions={promiseOptions}
      />
      <CustomerFormDrawer
        formik={customerFormik}
        isOpen={isCustomerFormOpen}
        onClose={onCloseCustomerFormDrawer}
      />
    </>
  );
}
