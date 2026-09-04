import { useCallback, useEffect, useState } from "react";
import instance from "../instance";
import useAsyncCall from "./useAsyncCall";
import { useParams, useSearchParams } from "react-router-dom";
import useQuery from "./useQuery";
import moment from "moment";
export default function useDateFilterFetch({ entity, storageKey, extraParams = {} }) {
  const [billItems, setBillItems] = useState({
    totalPages: 0,
    totalCount: 0,
    currentPage: 0,
    items: [],
    reachedLimit: true,
    reachedVouchersLimit: true,
  });
  const { requestAsyncHandler } = useAsyncCall();
  const [status, setStatus] = useState("loading");
  const controller = new AbortController();
  const { orgId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = isNaN(parseInt(searchParams.get("page")))
    ? 1
    : parseInt(searchParams.get("page"));
  const searchQuery = searchParams.get("query");
  const queryNum = searchParams.get("num");
  const queryParty = searchParams.get("party");
  const today = moment();
  const monthAgo = moment().subtract(30, "days");
  const defaultDateFilter = {
    startDate: monthAgo.format("YYYY-MM-DD"),
    endDate: today.format("YYYY-MM-DD"),
    num: queryNum || "",
    party: queryParty || "",
    partyDetails: null,
  };
  const scopedStorageKey = storageKey
    ? `${storageKey}:${orgId || "default"}`
    : null;
  const [dateFilter, setDateFilter] = useState(() => {
    let initialFilter = { ...defaultDateFilter };
    if (scopedStorageKey && typeof window !== "undefined") {
      try {
        const rawDateFilter = window.localStorage.getItem(scopedStorageKey);
        if (rawDateFilter) {
          const parsedDateFilter = JSON.parse(rawDateFilter);
          const isExplicitlyCleared = parsedDateFilter?.startDate === "" && parsedDateFilter?.endDate === "";
          const hasValidStartDate = parsedDateFilter?.startDate === "" || moment(
            parsedDateFilter?.startDate,
            "YYYY-MM-DD",
            true,
          ).isValid();
          const hasValidEndDate = parsedDateFilter?.endDate === "" || moment(
            parsedDateFilter?.endDate,
            "YYYY-MM-DD",
            true,
          ).isValid();
          if (isExplicitlyCleared || (hasValidStartDate && hasValidEndDate)) {
            initialFilter = {
              ...initialFilter,
              startDate: parsedDateFilter.startDate !== undefined ? parsedDateFilter.startDate : initialFilter.startDate,
              endDate: parsedDateFilter.endDate !== undefined ? parsedDateFilter.endDate : initialFilter.endDate,
              num: (parsedDateFilter.num || "").trim(),
              party: parsedDateFilter.party || "",
              partyDetails: parsedDateFilter.partyDetails || null,
            };
          }
        }
      } catch (error) {
        // Fallback to default
      }
    }
    // URL parameters should override everything
    if (queryNum) initialFilter.num = queryNum;
    if (queryParty) initialFilter.party = queryParty;
    return initialFilter;
  });

  // Fetch party details if ID is in URL but details are missing (for shared links)
  useEffect(() => {
    if (dateFilter.party && !dateFilter.partyDetails) {
      const fetchPartyDetails = async () => {
        try {
          const { data } = await instance.get(`/api/v1/organizations/${orgId}/parties/${dateFilter.party}`);
          setDateFilter(prev => ({ ...prev, partyDetails: data.data }));
        } catch (error) {
          console.error("Failed to fetch party details for filter", error);
        }
      };
      fetchPartyDetails();
    }
  }, [dateFilter.party, orgId]);

  // Sync URL with filter state
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let changed = false;

    if (dateFilter.num !== (params.get("num") || "")) {
      if (dateFilter.num) params.set("num", dateFilter.num);
      else params.delete("num");
      changed = true;
    }

    if (dateFilter.party !== (params.get("party") || "")) {
      if (dateFilter.party) params.set("party", dateFilter.party);
      else params.delete("party");
      changed = true;
    }

    if (changed) {
      setSearchParams(params, { replace: true });
    }
  }, [dateFilter.num, dateFilter.party, setSearchParams]);

  const fetchItems = requestAsyncHandler(async () => {
    setStatus("loading");
    const { data } = await instance.get(
      `/api/v1/organizations/${orgId}/${entity}`,
      {
        params: {
          search: searchQuery,
          startDate: dateFilter.startDate,
          endDate: dateFilter.endDate,
          num: dateFilter.num,
          party: dateFilter.party,
          page,
          ...extraParams,
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
      reachedVouchersLimit: data.reachedVouchersLimit,
    });
    setStatus("success");
    return () => {
      controller.abort();
    };
  }, [searchQuery, dateFilter, page, entity, JSON.stringify(extraParams)]);

  const onChangeDateFilter = useCallback((e) => {
    if (!e) return;
    const target = e.target || e.currentTarget;
    if (target?.name) {
      setDateFilter((prev) => ({
        ...prev,
        [target.name]: target.value,
      }));
    } else if (typeof e === "object") {
      // Handle direct value updates (like from Select components or { startDate, endDate })
      setDateFilter((prev) => ({
        ...prev,
        ...e,
      }));
    }
  }, []);

  const onSetDateFilter = useCallback(({ start, end }) => {
    setDateFilter((prev) => ({
      ...prev,
      endDate: end,
      startDate: start,
    }));
  }, []);

  useEffect(() => {
    if (!scopedStorageKey || typeof window === "undefined") return;
    window.localStorage.setItem(scopedStorageKey, JSON.stringify(dateFilter));
  }, [scopedStorageKey, dateFilter]);
  useEffect(() => {
    if (entity) fetchItems();
  }, [searchQuery, dateFilter, page, entity, JSON.stringify(extraParams)]);
  const { items, currentPage, totalCount, totalPages, reachedLimit, reachedVouchersLimit } =
    billItems;
  return {
    items,
    reachedLimit,
    reachedVouchersLimit,
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
