import React from "react";
import VertIconMenu from "../common/table-layout/VertIconMenu";
export default function ProductMenu({
  product,
  onOpenDrawerForEditingProduct,
  onOpenProduct,
  onDeleteProduct,
}) {
  return (
    <VertIconMenu
      showItem={() => {
        onOpenProduct(product);
      }}
      editItem={() => {
        onOpenDrawerForEditingProduct(product);
      }}
      deleteItem={() => {
        onDeleteProduct(product);
      }}
    />
  );
}
