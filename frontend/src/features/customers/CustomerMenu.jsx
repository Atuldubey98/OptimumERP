import React from "react";
import VertIconMenu from "../common/table-layout/VertIconMenu";
import { useDisclosure } from "@chakra-ui/react";
import AlertModal from "../common/AlertModal";
export default function CustomerMenu({
  customer,
  onOpenDrawerForEditingCustomer,
  onOpenCustomer,
  onDeleteCustomer,
}) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <>
      <VertIconMenu
        showItem={() => {
          onOpenCustomer(customer);
        }}
        editItem={() => {
          onOpenDrawerForEditingCustomer(customer);
        }}
        deleteItem={() => {
          onOpen();
        }}
      />
      <AlertModal
        body={"Do you want to delete the customer ?"}
        header={"Delete customer"}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={() => {
          onDeleteCustomer(customer);
          onClose();
        }}
      />
    </>
  );
}
