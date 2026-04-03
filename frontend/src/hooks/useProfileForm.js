import { useToast } from "@chakra-ui/react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import instance from "../instance";
import useAuth from "./useAuth";
import { useEffect } from "react";

export default function useProfileForm({ closeForm }) {
  const { user, fetchUserDetails } = useAuth();
  const { t } = useTranslation("common");

  const toast = useToast();
  const formik = useFormik({
    initialValues: {
      name: user?.name,
    },
    onSubmit: async (values, { setSubmitting }) => {
      const { data } = await instance.patch("/api/v1/users", values);
      toast({
        title: t("common_ui.toasts.success"),
        description: t(data.message, { defaultValue: data.message }),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (closeForm) closeForm();
      fetchUserDetails();
      setSubmitting(false);
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required(t("common_ui.validation.messages.name_required"))
        .min(3, t("common_ui.validation.messages.min_length_3"))
        .max(60, t("common_ui.validation.messages.max_length_60")),
    }),
  });
  return { formik };
}
