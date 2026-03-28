import { useToast } from "@chakra-ui/react";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { defaultQuoteItem } from "../features/estimates/create/data";
import instance from "../instance";
import useAsyncCall from "./useAsyncCall";
import useCurrentOrgCurrency from "./useCurrentOrgCurrency";
export default function useEstimateForm() {
  const [status, setStatus] = useState("loading");
  const { t } = useTranslation("common");
  const { getDefaultReceiptItem, receiptDefaults } = useCurrentOrgCurrency();
  const defaultReceiptItem = getDefaultReceiptItem();
  const quoteSchema = Yup.object().shape({
    sequence: Yup.number().required(t("common_ui.validation.messages.quote_number_required")),
    party: Yup.string().required(t("common_ui.validation.messages.party_required")),
    billingAddress: Yup.string().required(t("common_ui.validation.messages.billing_address_required")),
    date: Yup.date().required(t("common_ui.validation.messages.date_required")),
    status: Yup.string().required(t("common_ui.validation.messages.status_required")),
    items: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string().required(t("common_ui.validation.messages.item_name_required")),
          quantity: Yup.number()
            .required(t("common_ui.validation.messages.quantity_required"))
            .min(1, t("common_ui.validation.messages.quantity_min_1")),
          um: Yup.string().required(t("common_ui.validation.messages.unit_of_measure_required")),
          code: Yup.string().optional(),
          tax: Yup.string().required(t("common_ui.validation.messages.gst_required")),
          price: Yup.number()
            .required(t("common_ui.validation.messages.price_required"))
            .min(0, t("common_ui.validation.messages.price_positive")),
        }),
      )
      .min(1),
    terms: Yup.string().required(t("common_ui.validation.messages.terms_required")),
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
      const res = await instance[_id ? "patch" : "post"](
        `/api/v1/organizations/${orgId}/quotes/${_id || ""}`,
        {
          ...estimate,
          items,
        },
      );
      toast({
        title: t("common_ui.toasts.success"),
        description: res?.data?.message,
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
          `/api/v1/organizations/${orgId}/quotes/nextQuoteNo`,
        );
        formik.setFieldValue("sequence", data.data);
        setStatus("success");
      }

      async function fetchQuotation() {
        setStatus("loading");
        const { data } = await instance.get(
          `/api/v1/organizations/${orgId}/quotes/${quoteId}`,
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
          items: items.map((item) => ({
            ...item,
            tax: item.tax._id,
            um: item.um._id,
          })),
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
