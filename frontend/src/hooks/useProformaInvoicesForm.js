import { useToast } from "@chakra-ui/react";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import instance from "../instance";
import useAsyncCall from "./useAsyncCall";
import useCurrentOrgCurrency from "./useCurrentOrgCurrency";

export default function useProformaInvoicesForm() {
  const [status, setStatus] = useState("loading");
  const { getDefaultReceiptItem, receiptDefaults } = useCurrentOrgCurrency();
  const defaultReceiptItem = getDefaultReceiptItem();
  const proformaInvoiceSchema = Yup.object().shape({
    sequence: Yup.number()
      .required("Invoice number is required")
      .label("Invoice Number"),
    party: Yup.string().required("Party is required").label("Party"),
    billingAddress: Yup.string()
      .min(2, "Billing Address Cannot be less than 2")
      .max(200, "Billing Address Cannot be greater than 200")
      .label("Billing address"),
    date: Yup.date().required("Date is required").label("Date"),
    status: Yup.string().required("Status is required"),
    poNo: Yup.string().optional(),
    poDate: Yup.string().optional(),
    items: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string().required("Item name is required"),
          quantity: Yup.number()
            .required("Quantity is required")
            .min(1, "Quantity must be at least 1"),
          um: Yup.string().required("Unit of measure is required"),
          tax: Yup.string().required("Tax is required"),
          price: Yup.number()
            .required("Price is required")
            .min(0, "Price must be a positive number"),
        }),
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
  const { orgId, proformaInvoiceId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const defaultInvoice = {
    sequence: 1,
    date: new Date(Date.now()).toISOString().split("T")[0],
    status: "sent",
    items: [defaultReceiptItem],
    terms: receiptDefaults.terms?.proformaInvoice,
    description: "",
    poNo: "",
    billingAddress: "",
    poDate: "",
    prefix: "",
  };
  const formik = useFormik({
    initialValues: defaultInvoice,
    validationSchema: proformaInvoiceSchema,
    validateOnChange: false,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { _id, partyDetails, ...invoice } = values;
      const items = values.items.map(({ _id, ...item }) => item);
      const res = await instance[_id ? "patch" : "post"](
        `/api/v1/organizations/${orgId}/proformaInvoices/${_id || ""}`,
        {
          ...invoice,
          items,
        },
      );
      toast({
        title: "Success",
        description: res?.data?.message,
        status: _id ? "info" : "success",
        duration: 3000,
        isClosable: true,
      });
      navigate(`/${orgId}/proformaInvoices`);
      setSubmitting(false);
    }),
  });
  const fetchNextInvoiceNumber = requestAsyncHandler(async () => {
    setStatus("loading");
    const { data } = await instance.get(
      `/api/v1/organizations/${orgId}/proformaInvoices/nextProformaInvoiceNo`,
    );
    formik.setFieldValue("sequence", data.data);
    setStatus("success");
  });
  useEffect(() => {
    (async () => {
      if (proformaInvoiceId) {
        await fetchProformaInvoice();
      } else {
        fetchNextInvoiceNumber();
      }
    })();
  }, []);
  return { formik, status };

  async function fetchProformaInvoice() {
    try {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/proformaInvoices/${proformaInvoiceId}`,
      );
      const {
        party,
        terms,
        sequence,
        date,
        status,
        prefix,
        items,
        description,
        billingAddress = "",
        poDate = "",
        poNo = "",
      } = data.data;
      formik.setValues({
        _id: data.data._id,
        party: party._id,
        terms,
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
        prefix,
        poDate: poDate ? poDate.split("T")[0] : "",
        poNo,
        billingAddress,
        createdBy: data.data?.createdBy._id,
      });
      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  }
}
