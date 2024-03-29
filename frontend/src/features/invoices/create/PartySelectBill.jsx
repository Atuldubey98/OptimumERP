import { useDisclosure } from "@chakra-ui/react";
import { AsyncCreatableSelect } from "chakra-react-select";
import React from "react";
import { useParams } from "react-router-dom";
import usePartyForm from "../../../hooks/usePartyForm";
import instance from "../../../instance";
import PartyFormDrawer from "../../parties/PartyFormDrawer";

export default function PartySelectBill({ formik }) {
  const { orgId } = useParams();
  const promiseOptions = async (searchQuery) => {
    const { data } = await instance.get(
      `/api/v1/organizations/${orgId}/parties/search`,
      {
        params: {
          keyword: searchQuery,
        },
      }
    );
    return data.data.map((party) => ({
      value: party,
      label: party.name,
    }));
  };
  const {
    isOpen: isPartyFormOpen,
    onClose: onClosePartyFormDrawer,
    onOpen: openPartyFormDrawer,
  } = useDisclosure();
  const { formik: partyFormik } = usePartyForm(
    promiseOptions,
    onClosePartyFormDrawer
  );
  return (
    <>
      <AsyncCreatableSelect
        value={
          formik.values.partyDetails && {
            value: formik.values?.partyDetails,
            label: formik.values?.partyDetails?.name,
          }
        }
        createOptionPosition="first"
        onChange={(e) => {
          if (!e) {
            formik.setFieldValue("party", undefined);
            formik.setFieldValue("billingAddress", "");
            formik.setFieldValue("partyDetails", undefined);
          } else {
            const party = e.value
            formik.setFieldValue("party", party._id);
            formik.setFieldValue("billingAddress", party.billingAddress);
            formik.setFieldValue("partyDetails", party);
          }
        }}
        onCreateOption={(input) => {
          partyFormik.setFieldValue("name", input);
          openPartyFormDrawer();
        }}
        isClearable
        loadOptions={promiseOptions}
      />
      <PartyFormDrawer
        formik={partyFormik}
        isOpen={isPartyFormOpen}
        onClose={onClosePartyFormDrawer}
      />
    </>
  );
}
