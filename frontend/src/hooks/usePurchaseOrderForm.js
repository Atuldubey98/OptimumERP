import React from "react";
import { useEffect, useState } from "react";
import useAsyncCall from "./useAsyncCall";
import * as Yup from "yup";
import { useToast } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import moment from "moment";
import instance from "../instance";
import { defaultInvoiceItem } from "../features/estimates/create/data";
import useCurrentOrgCurrency from "./useCurrentOrgCurrency";
export default function usePurchaseOrderForm({ saveAndNew }) {
  const [status, setStatus] = useState("loading");
  const { t } = useTranslation("common");
  const { getDefaultReceiptItem, receiptDefaults } = useCurrentOrgCurrency();
  const defaultReceiptItem = getDefaultReceiptItem();
  const purchaseOrderSchema = Yup.object().shape({
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
    sequence: Yup.number(),
    prefix: Yup.string().optional(),
    date: Yup.string().optional(),
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
        })
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
  const { orgId, purchaseOrderId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const defaultInvoice = {
    poNo: 1,
    date: moment().format("YYYY-MM-DD"),
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
     const res = await instance[_id ? "patch" : "post"](
        `/api/v1/organizations/${orgId}/purchaseOrders/${_id || ""}`,
        {
          ...purchaseOrder,
          items,
        }
      );
      toast({
        title: t("common_ui.toasts.success"),
        description: t(res?.data?.message, {
          defaultValue: res?.data?.message,
          entity: "Purchase Order",
        }),
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
        date: moment(date).format("YYYY-MM-DD"),
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
