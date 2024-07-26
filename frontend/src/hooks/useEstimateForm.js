import { useToast } from "@chakra-ui/react";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import { defaultQuoteItem } from "../features/estimates/create/data";
import instance from "../instance";
import useAsyncCall from "./useAsyncCall";
import useCurrentOrgCurrency from "./useCurrentOrgCurrency";
export default function useEstimateForm() {
  const [status, setStatus] = useState("loading");
  const { getDefaultReceiptItem, receiptDefaults } = useCurrentOrgCurrency();
  const defaultReceiptItem = getDefaultReceiptItem();
  const quoteSchema = Yup.object().shape({
    sequence: Yup.number().required("Quote number is required"),
    party: Yup.string().required("Party is required"),
    billingAddress: Yup.string().required("Billing Address is required"),
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
          code: Yup.string().optional(),
          tax: Yup.string().required("GST is required"),
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
  const { orgId, quoteId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      sequence: 1,
      date: new Date(Date.now()).toISOString().split("T")[0],
      billingAddress: "",
      status: "draft",
      items: [defaultReceiptItem],
      prefix: "",
      terms: receiptDefaults.terms?.quote,
      description: "",
    },
    validationSchema: quoteSchema,
    validateOnChange: false,
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
      navigate(`/${orgId}/estimates`);
      setSubmitting(false);
    }),
  });
  useEffect(() => {
    (async () => {
      try {
        if (quoteId) {
          await fetchQuotation();
        } else {
          await fetchSequence();
        }
      } catch (error) {
        setStatus("error");
      }
      async function fetchSequence() {
        setStatus("loading");
        const { data } = await instance.get(
          `/api/v1/organizations/${orgId}/quotes/nextQuoteNo`
        );
        formik.setFieldValue("sequence", data.data);
        setStatus("success");
      }

      async function fetchQuotation() {
        setStatus("loading");
        const { data } = await instance.get(
          `/api/v1/organizations/${orgId}/quotes/${quoteId}`
        );
        const {
          party,
          billingAddress = "",
          terms,
          sequence,
          date,
          status,
          prefix,
          items,
          description,
        } = data.data;
        formik.setValues({
          _id: data.data._id,
          party: party._id,
          terms,
          prefix,
          billingAddress,
          sequence,
          date: new Date(date).toISOString().split("T")[0],
          status,
          items,
          description,
          partyDetails: party,
          createdBy: data.data.createdBy._id,
        });
        setStatus("success");
      }
    })();
  }, [quoteId]);
  return { formik, status };
}
