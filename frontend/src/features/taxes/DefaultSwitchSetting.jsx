import { FormControl, FormLabel, Switch, useToast } from "@chakra-ui/react";
import React from "react";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import instance from "../../instance";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function DefaultSwitchSetting({
  selectedItem,
  receiptDefaultKey,
  successMessage,
}) {
  const { t } = useTranslation("tax");
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
      <FormLabel fontWeight={"bold"}>{t("tax_ui.form.is_default")}</FormLabel>
      <Switch
        isChecked={receiptDefaultValue._id === selectedItem._id}
        isDisabled={receiptDefaultValue._id === selectedItem._id}
        onChange={async () => {
          onSetNewSetting({
            ...setting,
            receiptDefaults: {
              ...setting.receiptDefaults,
              [receiptDefaultKey]: selectedItem,
            },
          });
          const settingsUrl = `/api/v1/organizations/${orgId}/settings`;
          const receiptDefaultUpdateKey = `receiptDefaults.${receiptDefaultKey}`;
          await instance.patch(settingsUrl, {
            [receiptDefaultUpdateKey]: selectedItem._id,
          });
          
          toast({
            title: t("tax_ui.toast.success_title"),
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
