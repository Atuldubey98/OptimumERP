import { useFormik } from "formik";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";

import useAsyncCall from "./useAsyncCall";
import instance from "../instance";

const createPartyDto = (t) =>
  Yup.object({
    name: Yup.string()
      .min(3, t("common_ui.validation.messages.min_3"))
      .max(80, t("common_ui.validation.messages.max_80"))
      .required(t("common_ui.validation.messages.party_name_required"))
      .label(t("common_ui.validation.labels.name")),
    shippingAddress: Yup.string()
      .max(150, t("common_ui.validation.messages.max_150"))
      .label(t("common_ui.validation.labels.shipping_address"))
      .optional(),
    billingAddress: Yup.string()
      .min(3, t("common_ui.validation.messages.min_3"))
      .max(150, t("common_ui.validation.messages.max_150"))
      .label(t("common_ui.validation.labels.billing_address")),
    gstNo: Yup.string().label(t("common_ui.validation.labels.gst_number")),
    panNo: Yup.string().label(t("common_ui.validation.labels.pan_number")),
  });
export default function usePartyForm(onAddedFetch, onCloseDrawer) {
  const { t } = useTranslation("common");
  const { requestAsyncHandler } = useAsyncCall();
  const { orgId = "" } = useParams();
  const formik = useFormik({
    initialValues: {
      name: "",
      billingAddress: "",
      gstNo: "",
      panNo: "",
      shippingAddress: "",
    },
    validationSchema: createPartyDto(t),
    validateOnChange: false,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { name, shippingAddress, billingAddress, gstNo, panNo, _id } =
        values;
      const party = {
        name,
        shippingAddress,
        billingAddress,
        gstNo,
        org: orgId,
        panNo,
      };
      let partyId = _id;
      if (_id)
        await instance.patch(
          `/api/v1/organizations/${orgId}/parties/${_id}`,
          party
        );
      else {
        const response = await instance.post(
          `/api/v1/organizations/${orgId}/parties`,
          party
        );
        partyId = response.data.data._id;
      }
      setSubmitting(false);
      onCloseDrawer();
      if (onAddedFetch) onAddedFetch({ ...values, _id: partyId });
      formik.resetForm();
    }),
  });
  return { formik };
}
