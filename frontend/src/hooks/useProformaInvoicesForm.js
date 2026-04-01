import { useToast } from "@chakra-ui/react";
import { useFormik } from "formik";
import moment from "moment";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import instance from "../instance";
import useAsyncCall from "./useAsyncCall";
import useCurrentOrgCurrency from "./useCurrentOrgCurrency";

export default function useProformaInvoicesForm() {
  const [status, setStatus] = useState("loading");
  const { t } = useTranslation("common");
  const { getDefaultReceiptItem, receiptDefaults } = useCurrentOrgCurrency();
  const defaultReceiptItem = getDefaultReceiptItem();
  const proformaInvoiceSchema = Yup.object().shape({
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
    items: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string().required(t("common_ui.validation.messages.item_name_required")),
          quantity: Yup.number()
            .required(t("common_ui.validation.messages.quantity_required"))
            .min(1, t("common_ui.validation.messages.quantity_min_1")),
          um: Yup.string().required(t("common_ui.validation.messages.unit_of_measure_required")),
          tax: Yup.string().required(t("common_ui.validation.messages.tax_required")),
          price: Yup.number()
            .required(t("common_ui.validation.messages.price_required"))
            .min(0, t("common_ui.validation.messages.price_positive")),
        }),
      )
      .min(1),
    terms: Yup.string()
      .required(t("common_ui.validation.messages.terms_required"))
      .label(t("common_ui.validation.labels.terms_conditions")),
    description: Yup.string()
      .max(80, t("common_ui.validation.messages.description_max_80"))
      .label(t("common_ui.validation.labels.description")),
  });
  const { requestAsyncHandler } = useAsyncCall();
  const { orgId, proformaInvoiceId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const defaultInvoice = {
    sequence: 1,
    date: moment().format("YYYY-MM-DD"),
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
        title: t("common_ui.toasts.success"),
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
        date: moment(date).format("YYYY-MM-DD"),
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
