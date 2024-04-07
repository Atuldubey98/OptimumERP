import { useEffect, useState } from "react";
import instance from "../instance";
import useAsyncCall from "./useAsyncCall";

export default function useOrganizations() {
  const [authorizedOrgs, setAuthorizedOrgs] = useState([]);
  const [status, setStatus] = useState("idle");
  const { requestAsyncHandler } = useAsyncCall();
  const fetchOrgs = requestAsyncHandler(async () => {
    setStatus("loading");
    const { data } = await instance.get(`/api/v1/organizations`);
    setAuthorizedOrgs(data.data);
    setStatus("success");
  });
  useEffect(() => {
    fetchOrgs();
  }, []);
  return { authorizedOrgs, loading: status === "loading", fetchOrgs };
}
