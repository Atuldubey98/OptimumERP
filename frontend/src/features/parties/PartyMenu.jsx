import React from "react";
import VertIconMenu from "../common/table-layout/VertIconMenu";
export default function PartyMenu({
  party,
  onOpenDrawerForEditingParty,
  onOpenParty,
  onDeleteParty,
  onOpenTransactionsForParty,
}) {
  return (
    <>
      <VertIconMenu
        showTransactions={onOpenTransactionsForParty}
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
