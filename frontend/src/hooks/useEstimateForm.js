import { useToast } from "@chakra-ui/react";
import { useFormik } from "formik";
import moment from "moment";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { defaultQuoteItem } from "../features/estimates/create/data";
import instance from "../instance";
import useAsyncCall from "./useAsyncCall";
import useCurrentOrgCurrency from "./useCurrentOrgCurrency";
export default function useEstimateForm() {
  const [status, setStatus] = useState("loading");
  const { t } = useTranslation("common");
  const location = useLocation();
  const { getDefaultReceiptItem, receiptDefaults, toSmallestUnit, fromSmallestUnit } = useCurrentOrgCurrency();
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
    terms: Yup.string(),
    description: Yup.string(),
  });
  const { requestAsyncHandler } = useAsyncCall();
  const { orgId, quoteId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      sequence: 1,
      date: moment().format("YYYY-MM-DD"),
      billingAddress: "",
      status: "draft",
      items: [defaultReceiptItem],
      prefix: "",
      terms: "",
      description: "",
    },
    validationSchema: quoteSchema,
    validateOnChange: false,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { _id, ...estimate } = values;
      const items = values.items.map(({ _id, ...item }) => ({ ...item, price: toSmallestUnit(item.price) }));
      const res = await instance[_id ? "patch" : "post"](
        `/api/v1/organizations/${orgId}/quotes/${_id || ""}`,
        {
          ...estimate,
          items,
        },
      );
      toast({
        title: t("common_ui.toasts.success"),
        description: t(res?.data?.message, {
          defaultValue: res?.data?.message,
          entity: "Quotation",
        }),
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
        } else if (location.state?.duplicateId) {
          await fetchDuplicateQuotation(location.state.duplicateId);
        } else {
          await fetchSequence();
        }
      } catch (error) {
        setStatus("error");
      }
      async function fetchDuplicateQuotation(dupId) {
        setStatus("loading");
        const [{ data: quoteData }, { data: seqData }] = await Promise.all([
          instance.get(`/api/v1/organizations/${orgId}/quotes/${dupId}`),
          instance.get(`/api/v1/organizations/${orgId}/quotes/nextQuoteNo`),
        ]);
        const {
          party,
          billingAddress = "",
          terms,
          prefix,
          items,
          description,
        } = quoteData.data;
        formik.setValues({
          party: party._id,
          terms,
          prefix,
          billingAddress,
          sequence: seqData.data,
          date: moment().format("YYYY-MM-DD"),
          status: "draft",
          items: items.map(({ _id, ...item }) => ({
            ...item,
            price: fromSmallestUnit(item.price),
            tax: item.tax?._id || item.tax,
            um: item.um?._id || item.um,
          })),
          description,
          partyDetails: party,
        });
        setStatus("success");
      }
      async function fetchSequence() {
        setStatus("loading");
        try {
          const { data } = await instance.get(
            `/api/v1/organizations/${orgId}/quotes/nextQuoteNo`,
          );
          formik.setFieldValue("sequence", data.data);
        } catch (error) {
          console.error("Failed to fetch next quote sequence", error);
        }
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
          date: moment(date).format("YYYY-MM-DD"),
          status,
          items: items.map((item) => ({
            ...item,
            price: fromSmallestUnit(item.price),
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
