import { useEffect, useState } from "react";
import instance from "../instance";
import useAsyncCall from "./useAsyncCall";
import { useParams } from "react-router-dom";
import useQuery from "./useQuery";

export default function useDateFilterFetch({
  entity
}) {
  const [items, setItems] = useState([]);
  const { requestAsyncHandler } = useAsyncCall();
  const [status, setStatus] = useState("idle");
  const { orgId } = useParams();
  const query = useQuery();
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
        },
      }
    );
    setItems(data.data);
    setStatus("success");
  }, [searchQuery, dateFilter]);
  const onChangeDateFilter = (e) =>
    setDateFilter({
      ...dateFilter,
      [e.currentTarget.name]: e.currentTarget.value,
    });

  useEffect(() => {
    fetchItems();
  }, [searchQuery, dateFilter]);
  return { items, onChangeDateFilter, dateFilter, status, fetchItems };
}
