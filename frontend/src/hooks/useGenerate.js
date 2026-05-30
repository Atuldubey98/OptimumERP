import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import instance from "../instance";

export default function useGenerate() {
  const { orgId } = useParams();
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const generate = useCallback(async (prompt, context = "", tools = []) => {
    setStatus("loading");
    setError(null);
    setResult(null);
    try {
      const response = await instance.post(
        `/api/v1/organizations/${orgId}/chats/generate`,
        { prompt, context, tools }
      );
      const data = response.data?.data;
      setResult(data?.result);
      setStatus("success");
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to generate text.";
      setError(msg);
      setStatus("error");
      throw err;
    }
  }, [orgId]);

  return { generate, status, error, result, setResult };
}
