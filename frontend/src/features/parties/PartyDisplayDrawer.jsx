import { useTranslation } from "react-i18next";
import ShowDrawer from "../common/ShowDrawer";

export default function DisplayPartyDrawer(props) {
  const { t } = useTranslation("party");
  return (
    <ShowDrawer
      onClickNewItem={props.onOpenDrawerForAddingNewParty}
      heading={t("party_ui.drawer.heading")}
      formBtnLabel={t("party_ui.drawer.create_button")}
      isOpen={props.isPartyDrawerOpen}
      disable={props.reachedLimit}
      item={{
        ...props.selectedToShowParty,
        updatedByName: props.selectedToShowParty?.updatedBy?.name,
        createdByName: props.selectedToShowParty?.createdBy?.name,
      }}
      onClose={props.onCloseParty}
      selectedKeys={{
        name: t("party_ui.drawer.columns.name"),
        shippingAddress: t("party_ui.drawer.columns.shipping_address"),
        billingAddress: t("party_ui.drawer.columns.billing_address"),
        gstNo: t("party_ui.drawer.columns.gst_no"),
        panNo: t("party_ui.drawer.columns.pan_no"),
        updatedByName: t("party_ui.drawer.columns.updated_by"),
        createdByName: t("party_ui.drawer.columns.created_by"),
      }}
    />
  );
}
