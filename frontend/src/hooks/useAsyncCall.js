import { useToast } from "@chakra-ui/react";
import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";

export default function useAsyncCall() {
  const toast = useToast();
  const { t } = useTranslation("common");
  const requestAsyncHandler =
    (fn) =>
    (...values) => {
      Promise.resolve(fn(...values)).catch((err) => {
        if (import.meta.env.DEV) console.log(err);
        toast({
          title: isAxiosError(err)
            ? err.response?.data?.name || t("common_ui.toasts.error")
            : t("common_ui.toasts.error"),
          description: isAxiosError(err)
            ? err?.response?.data.message || t("common_ui.toasts.network_error")
            : t("common_ui.toasts.network_error"),
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
