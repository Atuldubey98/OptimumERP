import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import instance from "../instance";
import useQuery from "./useQuery";
import { useToast } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function useTaxes() {
  const [taxes, setTaxes] = useState([]);
  const [status, setStatus] = useState("idle");
  const [hasReachedLimit, setHasReachedLimit] = useState(true);
  const { t } = useTranslation("common");
  const { orgId } = useParams();
  const query = useQuery();
  const search = query.get("query") || "";
  useEffect(() => {
    getAll();
  }, [search]);
  const getAll = async () => {
    setStatus("loading");
    const { data } = await instance.get(
      `/api/v1/organizations/${orgId}/taxes?paginate=false&search=${search}`
    );
    setTaxes(data.data);
    setHasReachedLimit(data.reachedLimit);
    setStatus("idle");
  };
  const toast = useToast();
  const onToggleEnabled = async (selectedTax) => {
    try {
      setTaxes(
        taxes.map((tax) =>
          tax._id === selectedTax._id ? { ...tax, enabled: !tax.enabled } : tax
        )
      );
      const { data } = await instance.patch(
        `/api/v1/organizations/${orgId}/taxes/${selectedTax._id}`
      );
      toast({
        title: t("common_ui.toasts.success"),
        description: data.message,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t("common_ui.toasts.error"),
        description:
          error?.response?.data?.message || t("common_ui.toasts.network_error"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  return { taxes, status, getAll, onToggleEnabled, hasReachedLimit };
}
