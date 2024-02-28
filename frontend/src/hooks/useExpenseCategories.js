import { useCallback, useEffect, useState } from "react";
import useAsyncCall from "./useAsyncCall";
import instance from "../instance";
import { useParams } from "react-router-dom";
import useQuery from "./useQuery";

export default function useExpenseCategories() {
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [status, setStatus] = useState("idle");
  const { orgId } = useParams();
  const query = useQuery();
  const search = query.get("query") || "";
  const { requestAsyncHandler } = useAsyncCall(); 
  const fetchExpenseCategories = useCallback(
    requestAsyncHandler(async () => {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/expenses/categories`,
        {
          params: {
            search,
          },
        }
      );
      setExpenseCategories(data.data);
      setStatus("success");
    }),
    [search]
  );
  useEffect(() => {
    fetchExpenseCategories();
  }, [search]);
  return { fetchExpenseCategories, status, expenseCategories };
}
