import { useFormik } from "formik";
import { useEffect } from "react";
import { defaultQuoteItem } from "../features/estimates/create/data";
import * as Yup from "yup";
import useAsyncCall from "./useAsyncCall";
export default function useEstimateForm() {
  const quoteSchema = Yup.object().shape({
    quoteNo: Yup.string().required("Quote number is required"),
    date: Yup.date().required("Date is required"),
    status: Yup.string().required("Status is required"),
    items: Yup.array().of(
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
    ),
    terms: Yup.string().required("Terms are required"),
    description: Yup.string(),
  });
  const { requestAsyncHandler } = useAsyncCall();
  const formik = useFormik({
    initialValues: {
      quoteNo: "",
      date: new Date(Date.now()).toISOString().split("T")[0],
      status: "draft",
      items: [],
      terms: "Thanks for business !",
      description: "",
    },
    validationSchema: quoteSchema,
    onSubmit: requestAsyncHandler((values) => {
      console.log(values);
    }),
  });
  console.log(formik.errors);
  useEffect(() => {
    if (!formik.values.items.length)
      formik.setFieldValue("items", [defaultQuoteItem]);
  }, []);
  return { formik };
}
