import React, { useEffect, useState } from "react";
import useAsyncCall from "./useAsyncCall";
import { getOrgs } from "../api/org";

export default function useOrganizations() {
  const [authorizedOrgs, setAuthorizedOrgs] = useState([]);
  const [status, setStatus] = useState("idle");
  const { requestAsyncHandler } = useAsyncCall();
  const fetchOrgs = requestAsyncHandler(async () => {
    setStatus("loading");
    const { data } = await getOrgs();
    setAuthorizedOrgs(data.data);
    setStatus("success");
  });
  useEffect(() => {
    fetchOrgs();
  }, []);
  return { authorizedOrgs, loading: status === "loading", fetchOrgs };
}
