import { useFormik } from "formik";
import useAsyncCall from "./useAsyncCall";
import { useNavigate } from "react-router-dom";
import instance from "../instance";
import { useToast } from "@chakra-ui/react";

export default function useVerificationEmail() {
  const { requestAsyncHandler } = useAsyncCall();
  const navigate = useNavigate();
  const toast = useToast();
  const verifyRegisteredUserFormik = useFormik({
    initialValues: {
      userId: null,
      otp: "",
    },
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { data } = await instance.post(`/api/v1/users/verify`, values);
      toast({
        title: "Verified",
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
