import { useToast } from "@chakra-ui/react";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import * as Yup from "yup";
import { defaultQuoteItem } from "../features/estimates/create/data";
import instance from "../instance";
import useAsyncCall from "./useAsyncCall";
export default function useEstimateForm() {
  const quoteSchema = Yup.object().shape({
    quoteNo: Yup.number().required("Quote number is required"),
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
  const { orgId, quoteId } = useParams();
  const toast = useToast();
  const formik = useFormik({
    initialValues: {
      quoteNo: 1,
      date: new Date(Date.now()).toISOString().split("T")[0],
      status: "draft",
      items: [defaultQuoteItem],
      terms: "Thanks for business !",
      description: "",
    },
    validationSchema: quoteSchema,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { _id, ...estimate } = values;
      const items = values.items.map(({ _id, ...item }) => item);
      await instance[_id ? "patch" : "post"](
        `/api/v1/organizations/${orgId}/quotes/${_id || ""}`,
        {
          ...estimate,
          items,
        }
      );
      toast({
        title: "Success",
        description: _id ? "Quote updated" : "Quotation created",
        status: _id ? "info" : "success",
        duration: 3000,
        isClosable: true,
      });
      setSubmitting(false);
    }),
  });
  useEffect(() => {
    (async () => {
      if (quoteId) {
        const { data } = await instance.get(
          `/api/v1/organizations/${orgId}/quotes/${quoteId}`
        );
        const { customer, terms, quoteNo, date, status, items, description } =
          data.data;
        formik.setValues({
          _id: data.data._id,
          customer: customer._id,
          terms,
          quoteNo,
          date: new Date(date).toISOString().split("T")[0],
          status,
          items,
          description,
        });
      } else {
        const { data } = await instance.get(
          `/api/v1/organizations/${orgId}/quotes/next-quote-no`
        );
        formik.setFieldValue("quoteNo", data.data);
      }
    })();
  }, []);
  return { formik };
}
