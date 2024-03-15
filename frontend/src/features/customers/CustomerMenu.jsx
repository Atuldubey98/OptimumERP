import React from "react";
import VertIconMenu from "../common/table-layout/VertIconMenu";
export default function CustomerMenu({
  customer,
  onOpenDrawerForEditingCustomer,
  onOpenCustomer,
  onDeleteCustomer,
  onOpenTransactionsForCustomer,
}) {
  return (
    <>
      <VertIconMenu
        showTransactions={onOpenTransactionsForCustomer}
        showItem={() => {
          onOpenCustomer(customer);
        }}
        editItem={() => {
          onOpenDrawerForEditingCustomer(customer);
        }}
        deleteItem={() => {
          onDeleteCustomer(customer);
        }}
      />
    </>
  );
}
