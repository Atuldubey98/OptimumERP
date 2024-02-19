import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import instance from "../instance";
import useAsyncCall from "./useAsyncCall";
import useQuery from "./useQuery";

export default function useProducts() {
  const [productsPaginated, setProductsPaginated] = useState({
    products: [],
    totalCount: 0,
    totalPages: 0,
    page : 0
  });
  const [status, setStatus] = useState("idle");
  const { requestAsyncHandler } = useAsyncCall();
  const { orgId } = useParams();
  const query = useQuery();
  const page = isNaN(parseInt(query.get("page")))
    ? 1
    : parseInt(query.get("page"));
  const limit = isNaN(parseInt(query.get("limit")))
    ? 10
    : parseInt(query.get("limit"));
  const search = query.get("query");
  const controller = new AbortController();
  const fetchProducts =useCallback(requestAsyncHandler(async () => {
    setStatus("loading");
    const { data } = await instance.get(`/api/v1/organizations/${orgId}/products`, {
      signal : controller.signal,
      params: {
        page,
        limit,
        search,
      },
      
    });
    setProductsPaginated({
      products: data.data,
      totalCount: data.totalCount,
      totalPages: data.totalPages,
      page : data.page,
    });
    setStatus("success");
    return ()=>{
      controller.abort();
    }
  }),[search, page]);
  const { products, totalCount, totalPages, page  : currentPage} = productsPaginated;
  return {
    loading: status === "loading",
    totalCount,
    products,
    currentPage,
    totalPages,
    fetchProducts,
  };
}
