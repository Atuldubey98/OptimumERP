import { FormControl, FormLabel, Switch, useToast } from "@chakra-ui/react";
import React from "react";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import instance from "../../instance";
import { useParams } from "react-router-dom";

export default function DefaultSwitchSetting({
  selectedItem,
  receiptDefaultKey,
  successMessage,
}) {
  const { receiptDefaults, setting, onSetNewSetting } = useCurrentOrgCurrency();
  const { orgId } = useParams();
  const receiptDefaultValue = receiptDefaults[receiptDefaultKey];
  const toast = useToast();
  return (
    <FormControl
      justifyContent={"flex-start"}
      display={"flex"}
      alignItems={"center"}
      gap={4}
    >
      <FormLabel fontWeight={"bold"}>Is Default ?</FormLabel>
      <Switch
        isChecked={receiptDefaultValue === selectedItem._id}
        isDisabled={receiptDefaultValue === selectedItem._id}
        onChange={async () => {
          onSetNewSetting({
            ...setting,
            receiptDefaults: {
              ...setting.receiptDefaults,
              [receiptDefaultKey]: selectedItem._id,
            },
          });
          const settingsUrl = `/api/v1/organizations/${orgId}/settings`;
          const receiptDefaultUpdateKey = `receiptDefaults.${receiptDefaultKey}`;
          await instance.patch(settingsUrl, {
            [receiptDefaultUpdateKey]: selectedItem._id,
          });
          toast({
            title: "Success",
            description: successMessage,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }}
      />
    </FormControl>
  );
}
