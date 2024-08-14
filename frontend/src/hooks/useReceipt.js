import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import instance from "../instance";

export default function useReceipt(onSetReceipt, receiptId) {
  const { type, id = receiptId, orgId } = useParams();
  const [status, setStatus] = useState("loading");
  const [receipt, setReceipt] = useState(null);
  const getReceiptById = async () => {
    try {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/${type}/${id}`
      );
      setReceipt(data.data);
      if (onSetReceipt) onSetReceipt(data.data);
      setStatus("idle");
    } catch (error) {
      setStatus("notfound");
    }
  };
  useEffect(() => {
    if (!id) {
      setStatus("notfound");
      return;
    }
    getReceiptById();
  }, [id]);
  const isReceiptNotFound = status === "notfound";
  const isLoading = status === "loading";

  return { status, receipt, isReceiptNotFound, isLoading };
}
