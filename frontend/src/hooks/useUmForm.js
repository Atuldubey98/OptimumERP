import { useToast } from "@chakra-ui/react";
import { useFormik } from "formik";
import instance from "../instance";
import { useParams } from "react-router-dom";
const defaultForm = {
  name: "",
  description: "",
  enabled: true,
  unit: "",
};
export default function useUmForm({ fetchUms, onClose }) {
  const toast = useToast();
  const { orgId } = useParams();
  const formik = useFormik({
    initialValues: defaultForm,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { data } = await instance.post(
          `/api/v1/organizations/${orgId}/ums`,
          values
        );
        toast({
          title: "Success",
          description: data.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setSubmitting(false);
        onClose();
        formik.resetForm(defaultForm);
        fetchUms();
      } catch (error) {
        toast({
          title: "Error",
          description: error?.response?.data?.message || "Error occured",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });
  return { formik };
}
