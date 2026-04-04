import { useEffect, useState } from "react";
import useAsyncCall from "./useAsyncCall";
import * as Yup from "yup";
import { useToast } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import instance from "../instance";
import { defaultInvoiceItem } from "../features/estimates/create/data";
import moment from "moment";
import useCurrentOrgCurrency from "./useCurrentOrgCurrency";

export default function usePurchaseForm({ saveAndNew }) {
  const [status, setStatus] = useState("loading");
  const { t } = useTranslation("common");
  const { getDefaultReceiptItem } = useCurrentOrgCurrency();
  const defaultReceiptItem = getDefaultReceiptItem();
  const purchaseSchema = Yup.object().shape({
    num: Yup.string().required(t("common_ui.validation.messages.purchase_number_required")),
    billingAddress: Yup.string().required(t("common_ui.validation.messages.party_address_required")),
    party: Yup.string().required(t("common_ui.validation.messages.party_required")),
    date: Yup.date().required(t("common_ui.validation.messages.date_required")),
    status: Yup.string().required(t("common_ui.validation.messages.status_required")),
    shippingCharges: Yup.number()
      .min(0, t("common_ui.validation.messages.price_positive"))
      .default(0),
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
    description: Yup.string(),
  });
  const { requestAsyncHandler } = useAsyncCall();
  const { orgId, purchaseId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      num: "",
      billingAddress: "",
      date: moment().format("YYYY-MM-DD"),
      status: "unpaid",
      items: [defaultReceiptItem],
      autoItems: false,
      description: "",
      poNo: "",
      poDate: "",
      shippingCharges: 0,
    },
    validationSchema: purchaseSchema,
    validateOnChange: false,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { _id, autoItems, ...purchase } = values;
      const items = values.items.map(({ _id, ...item }) => item);
      if (!_id && values.autoItems) {
        await instance.post(`/api/v1/organizations/${orgId}/products/bulk`, {
          items: items.map((item) => ({
            name: item.name,
            costPrice: item.price,
            sellingPrice: item.price,
            description: "",
            um: item.um,
            type: "goods",
            code: item.code,
            category: null,
          })),
        });
      }
      const res =  await instance[_id ? "patch" : "post"](
        `/api/v1/organizations/${orgId}/purchases/${_id || ""}`,
        {
          ...purchase,
          items,
        }
      );
      toast({
        title: t("common_ui.toasts.success"),
        description: t(res?.data?.message, {
          defaultValue: res?.data?.message,
          entity: "Purchase Invoice",
        }),
        status: _id ? "info" : "success",
        duration: 3000,
        isClosable: true,
      });
      setSubmitting(false);
      if (saveAndNew)
        formik.resetForm({
          num: "",
          billingAddress: "",
          date: moment().format("YYYY-MM-DD"),
          status: "unpaid",
          items: [defaultInvoiceItem],
          description: "",
          poNo: "",
          poDate: "",
          shippingCharges: 0,
          party: undefined,
          partyDetails: undefined,
        });
      else navigate(`/${orgId}/purchases`);
    }),
  });
  const fetchPurchaseInvoice = async () => {
    try {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/purchases/${purchaseId}`
      );
      const {
        party,
        billingAddress = "",
        num,
        date,
        status,
        items,
        description,
        poDate = "",
        poNo = "",
      } = data.data;
      formik.setValues({
        billingAddress,
        _id: data.data._id,
        party: party._id,
        partyDetails: party,
        num,
        date: moment(date).format("YYYY-MM-DD"),
        status,
        items: items.map((item) => ({
          ...item,
          tax: item.tax._id,
          um: item.um._id,
        })),
        description,
        poDate: poDate ? poDate.split("T")[0] : "",
        poNo,
        shippingCharges: data.data.shippingCharges || 0,
        createdBy: data.data.createdBy._id,
      });
      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  };
  useEffect(() => {
    if (purchaseId) fetchPurchaseInvoice();
    else setStatus("idle");
  }, [purchaseId]);
  return { formik, status };
}
