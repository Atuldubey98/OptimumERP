import { useCallback, useEffect, useState } from "react";
import useAsyncCall from "./useAsyncCall";
import { useParams } from "react-router-dom";
import useQuery from "./useQuery";
import instance from "../instance";

export default function usePartys() {
  const [parties, setPartys] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [reachedLimit, setReachedLimit] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPartys, setTotalPartys] = useState(0);
  const [status, setStatus] = useState("idle");
  const { requestAsyncHandler } = useAsyncCall();
  const { orgId } = useParams();
  const query = useQuery();
  const searchQuery = query.get("query");
  const page = query.get("page") || 1;
  const fetchPartys = useCallback(
    requestAsyncHandler(async () => {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/parties`,
        {
          params: {
            search: searchQuery,
            page,
          },
        }
      );
      setTotalPartys(data.total);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setPartys(data.data);
      setReachedLimit(data.reachedLimit);
      setStatus("success");
    }),
    [searchQuery, page]
  );
  useEffect(() => {
    fetchPartys();
  }, [searchQuery, fetchPartys, page]);
  return {
    loading: status === "loading",
    parties,
    fetchPartys,
    currentPage,
    reachedLimit,
    totalPartys,
    totalPages,
  };
}
