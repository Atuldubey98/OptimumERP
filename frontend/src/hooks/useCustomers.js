import { useCallback, useEffect, useState } from "react";
import useAsyncCall from "./useAsyncCall";
import { useParams } from "react-router-dom";
import useQuery from "./useQuery";
import instance from "../instance";

export default function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [status, setStatus] = useState("idle");
  const { requestAsyncHandler } = useAsyncCall();
  const { orgId } = useParams();
  const query = useQuery();
  const searchQuery = query.get("query");
  const page = query.get("page") || 1;
  const fetchCustomers = useCallback(
    requestAsyncHandler(async () => {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/customers`,
        {
          params: {
            search: searchQuery,
            page,
          },
        }
      );
      setTotalCustomers(data.total);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setCustomers(data.data);
      setStatus("success");
    }),
    [searchQuery, page]
  );
  useEffect(() => {
    fetchCustomers();
  }, [searchQuery, fetchCustomers, page]);
  console.log({
    totalCustomers,
    totalPages,
    currentPage,
  });
  return {
    loading: status === "loading",
    customers,
    fetchCustomers,
    currentPage,
    totalCustomers,
    totalPages,
  };
}
