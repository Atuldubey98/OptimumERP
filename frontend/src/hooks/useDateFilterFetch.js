import { useEffect, useState } from "react";
import instance from "../instance";
import useAsyncCall from "./useAsyncCall";
import { useParams } from "react-router-dom";
import useQuery from "./useQuery";

export default function useDateFilterFetch({ entity }) {
  const [billItems, setBillItems] = useState({
    totalPages: 0,
    totalCount: 0,
    currentPage: 0,
    items: [],
  });
  const { requestAsyncHandler } = useAsyncCall();
  const [status, setStatus] = useState("idle");
  const controller = new AbortController();
  const { orgId } = useParams();
  const query = useQuery();
  const page = isNaN(parseInt(query.get("page")))
    ? 1
    : parseInt(query.get("page"));
  const searchQuery = query.get("query");
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const [dateFilter, setDateFilter] = useState({
    startDate: sevenDaysAgo.toISOString().split("T")[0],
    endDate: today.toISOString().split("T")[0],
  });
  const fetchItems = requestAsyncHandler(async () => {
    setStatus("loading");
    const { data } = await instance.get(
      `/api/v1/organizations/${orgId}/${entity}`,
      {
        params: {
          search: searchQuery,
          startDate: dateFilter.startDate,
          endDate: dateFilter.endDate,
          page,
        },
        signal: controller.signal,
      }
    );
    setBillItems({
      items: data.data,
      totalCount: data.total,
      currentPage: data.page,
      totalPages: data.totalPages,
    });
    setStatus("success");
    return () => {
      controller.abort();
    };
  }, [searchQuery, dateFilter, page]);
  const onChangeDateFilter = (e) =>
    setDateFilter({
      ...dateFilter,
      [e.currentTarget.name]: e.currentTarget.value,
    });

  useEffect(() => {
    fetchItems();
  }, [searchQuery, dateFilter, page]);
  const { items, currentPage, totalCount, totalPages } = billItems;
  return {
    items,
    onChangeDateFilter,
    dateFilter,
    status,
    fetchItems,
    totalPages,
    currentPage,
    totalCount,
  };
}
