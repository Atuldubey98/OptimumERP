import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import React from "react";
import FormDrawerLayout from "../common/form-drawer-layout";

export default function PartyFormDrawer({ isOpen, onClose, formik }) {
  const { t } = useTranslation("party");
  return (
    <FormDrawerLayout
      isSubmitting={formik.isSubmitting}
      formBtnLabel={formik.values._id ? t("party_ui.form.update_button") : t("party_ui.form.add_button")}
      formHeading={
        formik.values._id ? t("party_ui.form.update_heading") : t("party_ui.form.new_heading")
      }
      handleFormSubmit={formik.handleSubmit}
      isOpen={isOpen}
      onClose={onClose}
    >
      <Grid gap={4}>
        <FormControl
          isRequired
          isInvalid={formik.errors.name && formik.touched.name}
        >
          <FormLabel>{t("party_ui.form.name_label")}</FormLabel>
          <Input
            onChange={formik.handleChange}
            name="name"
            autoFocus
            type="text"
            value={formik.values.name}
            placeholder={t("party_ui.form.name_placeholder")}
          />
          <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
        </FormControl>
        <FormControl
          isRequired
          isInvalid={
            formik.errors.billingAddress && formik.touched.billingAddress
          }
        >
          <FormLabel>{t("party_ui.form.billing_address_label")}</FormLabel>
          <Input
            onChange={formik.handleChange}
            name="billingAddress"
            type="text"
            value={formik.values.billingAddress}
            placeholder={t("party_ui.form.billing_address_placeholder")}
          />
          <FormErrorMessage>{formik.errors.billingAddress}</FormErrorMessage>
        </FormControl>
        <FormControl
          isInvalid={
            formik.errors.shippingAddress && formik.touched.shippingAddress
          }
        >
          <FormLabel>{t("party_ui.form.shipping_address_label")}</FormLabel>
          <Input
            onChange={formik.handleChange}
            name="shippingAddress"
            type="text"
            value={formik.values.shippingAddress}
            placeholder={t("party_ui.form.shipping_address_placeholder")}
          />
          <FormErrorMessage>{formik.errors.shippingAddress}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={formik.errors.gstNo && formik.touched.gstNo}>
          <FormLabel>{t("party_ui.form.gst_label")}</FormLabel>
          <Input
            onChange={formik.handleChange}
            name="gstNo"
            type="text"
            value={formik.values.gstNo}
            placeholder={t("party_ui.form.gst_placeholder")}
          />
          <FormErrorMessage>{formik.errors.gstNo}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={formik.errors.panNo && formik.touched.panNo}>
          <FormLabel>{t("party_ui.form.pan_label")}</FormLabel>
          <Input
            onChange={formik.handleChange}
            name="panNo"
            type="text"
            value={formik.values.panNo}
            placeholder={t("party_ui.form.pan_placeholder")}
          />
          <FormErrorMessage>{formik.errors.gstNo}</FormErrorMessage>
        </FormControl>
      </Grid>
    </FormDrawerLayout>
  );
}
