import React from "react";
import VertIconMenu from "../common/table-layout/VertIconMenu";
import { useNavigate, useParams } from "react-router-dom";
export default function PartyMenu({
  party,
  onOpenDrawerForEditingParty,
  onOpenParty,
  onDeleteParty,
  onOpenTransactionsForParty,
}) {
  const navigate = useNavigate();
  const { orgId } = useParams();
  return (
    <>
      <VertIconMenu
        showTransactions={onOpenTransactionsForParty}
        showContacts={() => {
          navigate(`/${orgId}/parties/${party._id}/contacts`);
        }}
        showItem={() => {
          onOpenParty(party);
        }}
        editItem={() => {
          onOpenDrawerForEditingParty(party);
        }}
        deleteItem={() => {
          onDeleteParty(party);
        }}
      />
    </>
  );
}
