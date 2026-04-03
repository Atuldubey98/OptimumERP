import { useEffect, useState } from "react";
import instance from "../instance";
import useAsyncCall from "./useAsyncCall";
import { useParams } from "react-router-dom";
import useQuery from "./useQuery";
import moment from "moment";
export default function useDateFilterFetch({ entity, storageKey }) {
  const [billItems, setBillItems] = useState({
    totalPages: 0,
    totalCount: 0,
    currentPage: 0,
    items: [],
    reachedLimit: true,
  });
  const { requestAsyncHandler } = useAsyncCall();
  const [status, setStatus] = useState("loading");
  const controller = new AbortController();
  const { orgId } = useParams();
  const query = useQuery();
  const page = isNaN(parseInt(query.get("page")))
    ? 1
    : parseInt(query.get("page"));
  const searchQuery = query.get("query");
  const today = moment();
  const monthAgo = moment().subtract(30, "days");
  const defaultDateFilter = {
    startDate: monthAgo.format("YYYY-MM-DD"),
    endDate: today.format("YYYY-MM-DD"),
  };
  const scopedStorageKey = storageKey
    ? `${storageKey}:${orgId || "default"}`
    : null;
  const [dateFilter, setDateFilter] = useState(() => {
    if (!scopedStorageKey || typeof window === "undefined") {
      return defaultDateFilter;
    }
    try {
      const rawDateFilter = window.localStorage.getItem(scopedStorageKey);
      if (!rawDateFilter) return defaultDateFilter;
      const parsedDateFilter = JSON.parse(rawDateFilter);
      const hasValidStartDate = moment(
        parsedDateFilter?.startDate,
        "YYYY-MM-DD",
        true,
      ).isValid();
      const hasValidEndDate = moment(
        parsedDateFilter?.endDate,
        "YYYY-MM-DD",
        true,
      ).isValid();
      if (!hasValidStartDate || !hasValidEndDate) return defaultDateFilter;
      return {
        startDate: parsedDateFilter.startDate,
        endDate: parsedDateFilter.endDate,
      };
    } catch (error) {
      return defaultDateFilter;
    }
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
      reachedLimit: data.reachedLimit,
    });
    setStatus("success");
    return () => {
      controller.abort();
    };
  }, [searchQuery, dateFilter, page, entity]);
  const onChangeDateFilter = (e) =>
    setDateFilter({
      ...dateFilter,
      [e.currentTarget.name]: e.currentTarget.value,
    });
  const onSetDateFilter = ({ start, end }) => {
    setDateFilter({
      endDate: end,
      startDate: start,
    });
  };
  useEffect(() => {
    if (!scopedStorageKey || typeof window === "undefined") return;
    window.localStorage.setItem(scopedStorageKey, JSON.stringify(dateFilter));
  }, [scopedStorageKey, dateFilter]);
  useEffect(() => {
    if (entity) fetchItems();
  }, [searchQuery, dateFilter, page, entity]);
  const { items, currentPage, totalCount, totalPages, reachedLimit } =
    billItems;
  return {
    items,
    reachedLimit,
    onChangeDateFilter,
    dateFilter,
    status,
    fetchItems,
    onSetDateFilter,
    totalPages,
    currentPage,
    totalCount,
  };
}
