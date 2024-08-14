import ShowDrawer from "../common/ShowDrawer";

export default function DisplayPartyDrawer(props) {
  return (
    <ShowDrawer
      onClickNewItem={props.onOpenDrawerForAddingNewParty}
      heading={"Party"}
      formBtnLabel={"Create New"}
      isOpen={props.isPartyDrawerOpen}
      disable={props.reachedLimit}
      item={{
        ...props.selectedToShowParty,
        updatedByName: props.selectedToShowParty?.updatedBy?.name,
        createdByName: props.selectedToShowParty?.createdBy?.name,
      }}
      onClose={props.onCloseParty}
      selectedKeys={{
        name: "Name",
        shippingAddress: "Shipping address",
        billingAddress: "Billing address",
        gstNo: "GST No",
        panNo: "PAN No",
        updatedByName: "Updated By",
        createdByName: "Created By",
      }}
    />
  );
}
