import { useCallback, useEffect, useState } from "react";
import useAsyncCall from "./useAsyncCall";
import { getCustomers } from "../api/customer";
import { useParams } from "react-router-dom";
import useQuery from "./useQuery";

export default function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [status, setStatus] = useState("idle");
  const { requestAsyncHandler } = useAsyncCall();
  const { orgId } = useParams();
  const query = useQuery();
  const searchQuery = query.get("query");
  const fetchCustomers = useCallback(requestAsyncHandler(async () => {
    setStatus("loading");
    const { data } = await getCustomers(orgId, searchQuery);
    setCustomers(data.data);
    setStatus("success");
  }),[searchQuery]);
  useEffect(() => {
    fetchCustomers();
  }, [searchQuery, fetchCustomers]);
  return { loading: status === "loading", customers, fetchCustomers };
}
