import { useEffect, useState } from "react";
import useAsyncCall from "./useAsyncCall";
import * as Yup from "yup";
import { useToast } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import instance from "../instance";
import { defaultInvoiceItem } from "../features/estimates/create/data";

export default function useInvoicesForm() {
  const [status, setStatus] = useState("idle");
  const invoiceSchema = Yup.object().shape({
    invoiceNo: Yup.number().required("Invoice number is required"),
    customer: Yup.string().required("Customer is required"),
    date: Yup.date().required("Date is required"),
    status: Yup.string().required("Status is required"),
    items: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string().required("Item name is required"),
          quantity: Yup.number()
            .required("Quantity is required")
            .min(1, "Quantity must be at least 1"),
          um: Yup.string().required("Unit of measure is required"),
          gst: Yup.string().required("GST is required"),
          price: Yup.number()
            .required("Price is required")
            .min(0, "Price must be a positive number"),
        })
      )
      .min(1),
    terms: Yup.string().required("Terms are required"),
    description: Yup.string(),
  });
  const { requestAsyncHandler } = useAsyncCall();
  const { orgId, invoiceId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      invoiceNo: 1,
      date: new Date(Date.now()).toISOString().split("T")[0],
      status: "draft",
      items: [defaultInvoiceItem],
      terms: "Thanks for business !",
      description: "",
    },
    validationSchema: invoiceSchema,
    validateOnChange: false,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { _id, ...invoice } = values;
      const items = values.items.map(({ _id, ...item }) => item);
      await instance[_id ? "patch" : "post"](
        `/api/v1/organizations/${orgId}/invoices/${_id || ""}`,
        {
          ...invoice,
          items,
        }
      );
      toast({
        title: "Success",
        description: _id ? "Invoice updated" : "Invoice created",
        status: _id ? "info" : "success",
        duration: 3000,
        isClosable: true,
      });
      navigate(`/${orgId}/invoices`);
      setSubmitting(false);
    }),
  });
  useEffect(() => {
    (async () => {
      if (invoiceId) {
        requestAsyncHandler(async () => {
          setStatus("loading");
          const { data } = await instance.get(
            `/api/v1/organizations/${orgId}/invoices/${invoiceId}`
          );
          const {
            customer,
            terms,
            invoiceNo,
            date,
            status,
            items,
            description,
          } = data.data;
          formik.setValues({
            _id: data.data._id,
            customer: customer._id,
            terms,
            invoiceNo,
            date: new Date(date).toISOString().split("T")[0],
            status,
            items,
            description,
          });
          setStatus("success");
        })();
      } else {
        requestAsyncHandler(async () => {
          setStatus("loading");
          const { data } = await instance.get(
            `/api/v1/organizations/${orgId}/invoices/next-invoice-no`
          );
          formik.setFieldValue("invoiceNo", data.data);
          setStatus("success");
        })();
      }
    })();
  }, []);
  return { formik, status };
}
