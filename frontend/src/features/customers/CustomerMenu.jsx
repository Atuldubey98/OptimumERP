import React from "react";
import VertIconMenu from "../common/table-layout/VertIconMenu";
export default function CustomerMenu({ customer, onSetCustomer }) {
  return (
    <VertIconMenu
      showItem={() => {}}
      editItem={() => {
        onSetCustomer(customer);
      }}
      deleteItem={() => {
        console.log(customer);
      }}
    />
  );
}
