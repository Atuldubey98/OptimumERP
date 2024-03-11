import { useToast } from "@chakra-ui/react";
import { isAxiosError } from "axios";

export default function useAsyncCall() {
  const toast = useToast();
  const requestAsyncHandler =
    (fn) =>
    (...values) => {
      Promise.resolve(fn(...values)).catch((err) => {
        if (import.meta.env.DEV) {
          console.log(err);
        }
        toast({
          title: isAxiosError(err) ? err.response?.data?.name : "Error",
          description: isAxiosError(err)
            ? err?.response?.data.message || "Network error occured"
            : "Network error occured",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        if (values.length > 1) {
          const { setSubmitting } = values[1];
          setSubmitting(false);
        }
      });
    };
  return { requestAsyncHandler };
}
