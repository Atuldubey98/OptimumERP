import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import instance from "../instance";

export default function useTermsTemplates() {
  const { orgId } = useParams();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTemplates = async () => {
    if (!orgId) return;
    setIsLoading(true);
    try {
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/settings/templates?type=term`
      );
      setTemplates(data.data || []);
    } catch (error) {
      console.error("Failed to fetch term templates", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [orgId]);

  const defaultTemplate = templates.find((t) => t.isDefault && t.type === "term");

  return {
    templates,
    isLoading,
    defaultTemplate,
    refetchTemplates: fetchTemplates,
  };
}
