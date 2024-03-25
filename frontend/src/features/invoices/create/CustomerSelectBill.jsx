import { useDisclosure } from "@chakra-ui/react";
import { AsyncCreatableSelect } from "chakra-react-select";
import React from "react";
import { useParams } from "react-router-dom";
import useCustomerForm from "../../../hooks/useCustomerForm";
import instance from "../../../instance";
import CustomerFormDrawer from "../../customers/CustomerFormDrawer";

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
        onChange={(e) => {
          if (!e) {
            formik.setFieldValue("customer", undefined);
            formik.setFieldValue("billingAddress", "");
            formik.setFieldValue("customerDetails", undefined);
          } else {
            const customer = e.value
            formik.setFieldValue("customer", customer._id);
            formik.setFieldValue("billingAddress", customer.billingAddress);
            formik.setFieldValue("customerDetails", customer);
          }
        }}
        onCreateOption={(input) => {
          customerFormik.setFieldValue("name", input);
          openCustomerFormDrawer();
        }}
        isClearable
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
