import { useCallback, useEffect, useState } from "react";
import useQuery from "./useQuery";
import useAsyncCall from "./useAsyncCall";
import instance from "../instance";

const usePaginatedFetch = ({ url }) => {
  const [data, setData] = useState({
    items: [],
    totalPages: 0,
    totalCount: 0,
    currentPage: 0,
  });
  const query = useQuery();
  const [status, setStatus] = useState("idle");
  const page = query.get("page") || 1;
  const search = query.get("query");
  const { requestAsyncHandler } = useAsyncCall();
  const fetchFn = useCallback(
    requestAsyncHandler(async () => {
      setStatus("loading");
      const { data } = await instance.get(url);
      setData({
        items: data.data,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        totalCount: data.totalCount,
      });
      setStatus("success");
    }, [search, page])
  );
  useEffect(() => {
    fetchFn();
  }, [search, page]);
  return {
    fetchFn,
    data,
    status,
  };
};

export default usePaginatedFetch;
