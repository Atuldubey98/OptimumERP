import { useToast } from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import instance from "../instance";
import useAuth from "./useAuth";

export default function useProfileForm({ closeForm }) {
  const { user, fetchUserDetails } = useAuth();
  const toast = useToast();
  const formik = useFormik({
    initialValues: {
      name: user ? user.name : "",
    },
    onSubmit: async (values, { setSubmitting }) => {
      const { data } = await instance.patch("/api/v1/users", values);
      toast({
        title: "Success",
        description: data.message,
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
        .required("Name is required")
        .min(3, "Min length should be 3")
        .max(60, "Max length should be 60"),
    }),
  });
  return { formik };
}
