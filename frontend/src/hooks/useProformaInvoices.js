import React, { useState } from "react";
import usePaginatedFetch from "./usePaginatedFetch";
import { useParams } from "react-router-dom";

export default function useProformaInvoices() {
  const { orgId } = useParams();
  const { data, fetchFn, status } = usePaginatedFetch({
    url: `/api/v1/organizations/${orgId}/proformaInvoices`,
  });
  
  return { data, fetchFn, status };
}
