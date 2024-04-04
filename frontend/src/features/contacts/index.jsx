import React from "react";
import MainLayout from "../common/main-layout";
import usePaginatedFetch from "../../hooks/usePaginatedFetch";
import { useParams } from "react-router-dom";

export default function ContactsPage() {
  const { orgId } = useParams();
  const {} = usePaginatedFetch({
    url: `/api/v1/organizations/${orgId}/contacts`,
  });
  return <MainLayout></MainLayout>;
}
