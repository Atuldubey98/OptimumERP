import { useState } from "react";
import { useParams } from "react-router-dom";
import { getProducts } from "../api/product";
import useAsyncCall from "./useAsyncCall";
import useQuery from "./useQuery";

export default function useProducts() {
  const [productsPaginated, setProductsPaginated] = useState({
    products: [],
    totalCount: 0,
    totalPages: 0,
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
  const search = query.get("query") || "";
  const fetchProducts = requestAsyncHandler(async () => {
    setStatus("loading");
    const { data } = await getProducts({
      page,
      limit,
      orgId,
      search,
    });
    setProductsPaginated({
      ...productsPaginated,
      products: data.data,
      totalCount: data.totalCount,
      pages: data.totalPages,
    });
    setStatus("success");
  });
  const { products, totalCount, totalPages } = productsPaginated;
  return {
    loading: status === "loading",
    totalCount,
    products,
    totalPages,
    fetchProducts,
  };
}
