import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@chakra-ui/react";
import { isAxiosError } from "axios";
import instance from "../instance";
import useCurrentOrgCurrency from "./useCurrentOrgCurrency";

export default function useSaveBill() {
  const { i18n, t } = useTranslation();
  const toast = useToast();
  const [status, setStatus] = useState("idle");
  const settingContext = useCurrentOrgCurrency();
  const orgName = settingContext?.setting?.org?.alias || settingContext?.setting?.org?.name || "";

  const getHeading = useCallback((entity) => {
    const headingMap = {
      invoices: t("invoice_ui.modal.heading", { defaultValue: "Invoice" }),
      quotes: t("quote_ui.modal.heading", { defaultValue: "Quotation" }),
      proformaInvoices: t("proforma_invoice_ui.bill_modal.heading", { defaultValue: "Proforma Invoice" }),
      purchaseOrders: t("purchase_order_ui.bill_modal.heading", { defaultValue: "Purchase Order" }),
      purchases: t("purchase_ui.bill_modal.heading", { defaultValue: "Purchase" }),
    };
    return headingMap[entity] || "Document";
  }, [t]);

  const saveBill = useCallback(async (bill, entity, options = {}) => {
    if (!bill) return;

    setStatus("downloading");
    try {
      const orgId = bill.org?._id || bill.org || options.orgId;
      if (!orgId) {
        throw new Error("Organization ID is required");
      }

      const language = options.lng || i18n.resolvedLanguage || i18n.language || "en";

      const params = {
        lng: language,
        ...options.params
      };

      const downloadBill = `/api/v1/organizations/${orgId}/${entity}/${bill._id}/download`;

      const { data } = await instance.get(downloadBill, {
        responseType: "blob",
        params,
      });

      const href = URL.createObjectURL(data);
      const link = document.createElement("a");

      let heading = options.heading || getHeading(entity);
      let fileName = options.fileName;
      if (!fileName) {
        fileName = `${orgName ? orgName + "-" : ""}${heading}-${bill.num}.pdf`;
      }

      link.setAttribute("download", fileName);
      link.href = href;
      link.click();
      URL.revokeObjectURL(href);
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      
      const title = options.errorTitle || (isAxiosError(error)
        ? error.response?.data?.name
        : null) || t("common_ui.toasts.error", { defaultValue: "Error" });
        
      const backendMessage = isAxiosError(error)
        ? error.response?.data?.message
        : null;
        
      const description = options.errorDescription || backendMessage || t("common_ui.toasts.network_error", { defaultValue: "Some error occurred" });

      toast({
        title,
        description: t(description, { defaultValue: description }),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setStatus("idle");
    }
  }, [i18n, t, toast, orgName, getHeading]);

  const isDownloading = status === "downloading";

  return { saveBill, onSaveBill: saveBill, isDownloading, status };
}
