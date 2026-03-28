import { useToast } from "@chakra-ui/react";
import { useFormik } from "formik";
import moment from "moment";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import instance from "../instance";
import useAsyncCall from "./useAsyncCall";
import useSetting from "./useCurrentOrgCurrency";
export default function useInvoicesForm({ saveAndNew = false }) {
  const [status, setStatus] = useState("loading");
  const { t } = useTranslation("common");
  const { getDefaultReceiptItem, receiptDefaults } = useSetting();
  const defaultReceiptItem = getDefaultReceiptItem();

  const invoiceSchema = Yup.object().shape({
    sequence: Yup.number()
      .required(t("common_ui.validation.messages.invoice_number_required"))
      .label(t("common_ui.validation.labels.invoice_number")),
    party: Yup.string()
      .required(t("common_ui.validation.messages.party_required"))
      .label(t("common_ui.validation.labels.party")),
    billingAddress: Yup.string()
      .min(2, t("common_ui.validation.messages.billing_address_min_2"))
      .max(200, t("common_ui.validation.messages.billing_address_max_200"))
      .label(t("common_ui.validation.labels.billing_address")),
    date: Yup.date()
      .required(t("common_ui.validation.messages.date_required"))
      .label(t("common_ui.validation.labels.date")),
    status: Yup.string().required(t("common_ui.validation.messages.status_required")),
    poNo: Yup.string().optional(),
    poDate: Yup.string().optional(),
    dueDate: Yup.string().optional(),
    items: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string().required(t("common_ui.validation.messages.item_name_required")),
          quantity: Yup.number()
            .required(t("common_ui.validation.messages.quantity_required"))
            .min(1, t("common_ui.validation.messages.quantity_min_1")),
          um: Yup.string().required(t("common_ui.validation.messages.unit_of_measure_required")),
          tax: Yup.string().required(t("common_ui.validation.messages.gst_required")),
          price: Yup.number()
            .required(t("common_ui.validation.messages.price_required"))
            .min(0, t("common_ui.validation.messages.price_positive")),
        }),
      )
      .min(1),
    terms: Yup.string(),
    description: Yup.string()
      .max(80, t("common_ui.validation.messages.description_max_80"))
      .label(t("common_ui.validation.labels.description")),
  });
  const { requestAsyncHandler } = useAsyncCall();
  const { orgId, invoiceId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const defaultInvoice = {
    sequence: 1,
    date: new Date(Date.now()).toISOString().split("T")[0],
    status: "sent",
    items: [defaultReceiptItem],
    terms: receiptDefaults?.terms?.invoice,
    prefix: "",
    description: "",
    poNo: "",
    billingAddress: "",
    poDate: "",
  };
  const formik = useFormik({
    initialValues: defaultInvoice,
    validationSchema: invoiceSchema,
    validateOnChange: false,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { _id, ...invoice } = values;
      const items = values.items.map(({ _id, ...item }) => item);
      const response = await instance[_id ? "patch" : "post"](
        `/api/v1/organizations/${orgId}/invoices/${_id || ""}`,
        {
          ...invoice,
          items,
        },
      );
      toast({
        title: t("common_ui.toasts.success"),
        description: response.data.message,
        status: _id ? "info" : "success",
        duration: 3000,
        isClosable: true,
      });
      if (!saveAndNew || _id) {
        navigate(`/${orgId}/invoices`);
      } else {
        resetForm();
      }
      setSubmitting(false);
    }),
  });
  const fetchNextInvoiceNumber = requestAsyncHandler(async () => {
    setStatus("loading");
    const { data } = await instance.get(
      `/api/v1/organizations/${orgId}/invoices/nextSequence`,
    );
    formik.setFieldValue("sequence", data.data);
    setStatus("success");
  });
  useEffect(() => {
    if (invoiceId) {
      fetchCurrentInvoice();
      return;
    }
    fetchNextInvoiceNumber();
  }, []);
  const resetForm = async () => {
    formik.resetForm();
    fetchNextInvoiceNumber();
  };
  return { formik, status, resetForm };

  async function fetchCurrentInvoice() {
    try {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/invoices/${invoiceId}`,
      );
      const {
        party,
        terms,
        sequence,
        prefix,
        date,
        status,
        dueDate,
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
        prefix,
        dueDate: dueDate ? moment(dueDate).format("YYYY-MM-DD") : "",
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
        poNo,
        billingAddress,
        createdBy: data.data.createdBy._id,
      });
      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  }
}
