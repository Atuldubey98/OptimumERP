import { useToast } from "@chakra-ui/react";
import { useFormik } from "formik";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import instance from "../instance";
import useAsyncCall from "./useAsyncCall";
import useSetting from "./useCurrentOrgCurrency";

export default function useRecurringInvoicesForm() {
  const [status, setStatus] = useState("loading");
  const { t } = useTranslation("common");
  const { getDefaultReceiptItem, receiptDefaults, toSmallestUnit, fromSmallestUnit } = useSetting();
  const defaultReceiptItem = getDefaultReceiptItem();

  const recurringInvoiceSchema = Yup.object().shape({
    party: Yup.string()
      .required(t("common_ui.validation.messages.party_required"))
      .label(t("common_ui.validation.labels.party")),
    billingAddress: Yup.string()
      .min(2, t("common_ui.validation.messages.billing_address_min_2"))
      .max(200, t("common_ui.validation.messages.billing_address_max_200"))
      .label(t("common_ui.validation.labels.billing_address")),
    startDate: Yup.date()
      .required(t("common_ui.validation.messages.date_required"))
      .label(t("common_ui.validation.labels.start_date")),
    endDate: Yup.date()
      .min(Yup.ref('startDate'), t("common_ui.validation.messages.end_date_min_start_date"))
      .label(t("common_ui.validation.labels.end_date")),
    interval: Yup.string()
      .required(t("common_ui.validation.messages.interval_required"))
      .label(t("common_ui.validation.labels.interval")),
    dateOfEveryMonth: Yup.number()
      .when('interval', {
        is: (val) => ['monthly', 'quarterly', 'half_yearly', 'yearly'].includes(val),
        then: (schema) => schema.required(t("common_ui.validation.messages.date_of_month_required")),
        otherwise: (schema) => schema.nullable(),
      })
      .label(t("common_ui.validation.labels.date_of_month")),
    dayOfEveryWeek: Yup.string()
      .when('interval', {
        is: 'weekly',
        then: (schema) => schema.required(t("common_ui.validation.messages.day_of_week_required")),
        otherwise: (schema) => schema.nullable(),
      })
      .label(t("common_ui.validation.labels.day_of_week")),
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
        }),
      )
      .min(1),
    terms: Yup.string(),
    description: Yup.string()
      .max(80, t("common_ui.validation.messages.description_max_80"))
      .label(t("common_ui.validation.labels.description")),
    generateInvoice: Yup.boolean().default(true),
    generateProformaInvoice: Yup.boolean().default(false),
  });

  const { requestAsyncHandler } = useAsyncCall();
  const { orgId, recurringInvoiceId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const defaultRecurringInvoice = useMemo(() => ({
    startDate: moment().format("YYYY-MM-DD"),
    status: "active",
    interval: "monthly",
    items: [getDefaultReceiptItem()],
    terms: receiptDefaults?.terms?.invoice,
    description: "",
    billingAddress: "",
    shippingCharges: 0,
    dateOfEveryMonth: moment().date(),
    dayOfEveryWeek: moment().format('dddd').toLowerCase(),
    generateInvoice: true,
    generateProformaInvoice: false,
  }), [receiptDefaults, defaultReceiptItem]);

  const formik = useFormik({
    initialValues: defaultRecurringInvoice,
    validationSchema: recurringInvoiceSchema,
    validateOnChange: false,
    enableReinitialize: !recurringInvoiceId,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { _id, ...ri } = values;
      const items = values.items.map(({ _id, ...item }) => ({ ...item, price: toSmallestUnit(item.price) }));
      const response = await instance[_id ? "patch" : "post"](
        `/api/v1/organizations/${orgId}/recurringInvoices/${_id || ""}`,
        {
          ...ri,
          shippingCharges: toSmallestUnit(ri.shippingCharges),
          items,
        },
      );
      toast({
        title: t("common_ui.toasts.success"),
        description: t(response.data.message, {
          defaultValue: response.data.message,
          entity: "Recurring Invoice",
        }),
        status: _id ? "info" : "success",
        duration: 3000,
        isClosable: true,
      });
      navigate(`/${orgId}/recurringInvoices`);
      setSubmitting(false);
    }),
  });

  useEffect(() => {
    if (recurringInvoiceId) {
      fetchCurrentRecurringInvoice();
    } else {
      setStatus("success");
    }
  }, [recurringInvoiceId]);

  async function fetchCurrentRecurringInvoice() {
    try {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/recurringInvoices/${recurringInvoiceId}`,
      );
      const {
        party,
        terms,
        startDate,
        endDate,
        interval,
        status,
        items,
        description,
        billingAddress = "",
        dateOfEveryMonth,
        dayOfEveryWeek,
        generateInvoice,
        generateProformaInvoice,
      } = data.data;
      formik.setValues({
        _id: data.data._id,
        party: party._id,
        terms,
        startDate: moment(startDate).format("YYYY-MM-DD"),
        endDate: endDate ? moment(endDate).format("YYYY-MM-DD") : "",
        interval,
        status,
        partyDetails: party,
        items: items.map((item) => ({
          ...item,
          price: fromSmallestUnit(item.price),
          tax: item.tax._id,
          um: item.um._id,
        })),
        description,
        billingAddress,
        shippingCharges: fromSmallestUnit(data.data.shippingCharges || 0),
        createdBy: data.data.createdBy?._id,
        dateOfEveryMonth: dateOfEveryMonth || 1,
        dayOfEveryWeek: dayOfEveryWeek || "monday",
        generateInvoice: generateInvoice ?? true,
        generateProformaInvoice: generateProformaInvoice ?? false,
      });
      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  }

  return { formik, status };
}
