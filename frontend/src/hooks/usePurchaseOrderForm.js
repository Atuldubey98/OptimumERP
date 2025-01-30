import React from "react";
import { useEffect, useState } from "react";
import useAsyncCall from "./useAsyncCall";
import * as Yup from "yup";
import { useToast } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import instance from "../instance";
import { defaultInvoiceItem } from "../features/estimates/create/data";
import useCurrentOrgCurrency from "./useCurrentOrgCurrency";
export default function usePurchaseOrderForm({ saveAndNew }) {
  const [status, setStatus] = useState("loading");
  const { getDefaultReceiptItem, receiptDefaults } = useCurrentOrgCurrency();
  const defaultReceiptItem = getDefaultReceiptItem();
  const purchaseOrderSchema = Yup.object().shape({
    party: Yup.string().required("Party is required").label("Party"),
    billingAddress: Yup.string()
      .min(2, "Billing Address Cannot be less than 2")
      .max(200, "Billing Address Cannot be greater than 200")
      .label("Billing address"),
    date: Yup.date().required("Date is required").label("Date"),
    status: Yup.string().required("Status is required"),
    sequence: Yup.number(),
    prefix: Yup.string().optional(),
    date: Yup.string().optional(),
    items: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string().required("Item name is required"),
          quantity: Yup.number()
            .required("Quantity is required")
            .min(1, "Quantity must be at least 1"),
          um: Yup.string().required("Unit of measure is required"),
          tax: Yup.string().required("GST is required"),
          price: Yup.number()
            .required("Price is required")
            .min(0, "Price must be a positive number"),
        })
      )
      .min(1),
    terms: Yup.string()
      .required("Terms are required")
      .label("Terms & Conditions"),
    description: Yup.string()
      .max(80, "Description cannot be greater than 80")
      .label("Description"),
  });
  const { requestAsyncHandler } = useAsyncCall();
  const { orgId, purchaseOrderId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const defaultInvoice = {
    poNo: 1,
    date: new Date(Date.now()).toISOString().split("T")[0],
    status: "sent",
    items: [defaultReceiptItem],
    terms: receiptDefaults.terms?.purchaseOrder,
    description: "",
    billingAddress: "",
  };
  const formik = useFormik({
    initialValues: defaultInvoice,
    validationSchema: purchaseOrderSchema,
    validateOnChange: false,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { _id, ...purchaseOrder } = values;
      
      const items = values.items.map(({ _id, ...item }) => item);
      await instance[_id ? "patch" : "post"](
        `/api/v1/organizations/${orgId}/purchaseOrders/${_id || ""}`,
        {
          ...purchaseOrder,
          items,
        }
      );
      toast({
        title: "Success",
        description: _id ? "Purchase order updated" : "Purchase order created",
        status: _id ? "info" : "success",
        duration: 3000,
        isClosable: true,
      });
      if (!saveAndNew || _id) {
        navigate(`/${orgId}/purchaseOrders`);
      } else {
        resetForm();
      }
      setSubmitting(false);
    }),
  });  
  const fetchNextInvoiceNumber = requestAsyncHandler(async () => {
    setStatus("loading");
    const { data } = await instance.get(
      `/api/v1/organizations/${orgId}/purchaseOrders/nextPurchaseOrderNo`
    );
    formik.setFieldValue("sequence", data.data);
    setStatus("success");
  });
  useEffect(() => {
    (async () => {
      if (purchaseOrderId) await fetchPurchaseOrder();
      else fetchNextInvoiceNumber();
    })();
  }, [purchaseOrderId]);
  const resetForm = async () => {
    formik.resetForm();
    fetchNextInvoiceNumber();
  };
  return { formik, status, resetForm };

  async function fetchPurchaseOrder() {
    try {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/purchaseOrders/${purchaseOrderId}`
      );
      const {
        party,
        terms,
        date,
        status,
        items,
        prefix,
        description,
        billingAddress = "",
        poDate = "",
        sequence,
      } = data.data;
      formik.setValues({
        _id: data.data._id,
        party: party._id,
        terms,
        prefix,
        sequence,
        date: new Date(date).toISOString().split("T")[0],
        status,
        partyDetails: party,
        items: items.map((item) => ({
          ...item,
          tax: item.tax._id,
          um: item.um._id,
        })),
        description,
        poDate: poDate ? poDate.split("T")[0] : "",
        sequence,
        billingAddress,
        createdBy: data.data.createdBy._id,
      });
      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  }
}
