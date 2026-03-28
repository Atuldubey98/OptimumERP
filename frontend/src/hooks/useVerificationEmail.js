import { useFormik } from "formik";
import useAsyncCall from "./useAsyncCall";
import { useNavigate } from "react-router-dom";
import instance from "../instance";
import { useToast } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function useVerificationEmail({ scope = "register" } = {}) {
  const { requestAsyncHandler } = useAsyncCall();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation("user");
  const verifyRegisteredUserFormik = useFormik({
    initialValues: {
      userId: null,
      otp: "",
    },
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { data } = await instance.post(`/api/v1/users/verify`, values);
      toast({
        title: t(`user_ui.${scope}.toast_verified_title`),
        description: data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      verifyRegisteredUserFormik.resetForm();
      navigate("/");
      setSubmitting(false);
    }),
  });
  return { verifyRegisteredUserFormik };
}
