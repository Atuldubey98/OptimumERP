import React, { useState } from "react";
import { Tr, Td, Switch, useToast, Spinner, Tooltip } from "@chakra-ui/react";
import instance from "../../instance";
import { isAxiosError } from "axios";
import useAuth from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
export default function OrgUserRow({ orgUser, fetchUsers, organization }) {
  const [status, setStatus] = useState("idle");
  const toast = useToast();
  const { t } = useTranslation("admin");
  async function onChangeActiveUser(active) {
    try {
      setStatus("changing");
      const stateUrl = active
        ? `/api/v1/users/${organization}/activate`
        : `/api/v1/users/${organization}/deactivate`;
      const { data } = await instance.post(stateUrl, {
        userId: orgUser._id,
      });
      toast({
        title: t("toasts.success_title"),
        description: data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchUsers(organization);
    } catch (error) {
      toast({
        title: t("toasts.error_title"),
        description: isAxiosError(error)
          ? error.response.data.message
          : t("toasts.error_occurred"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setStatus("idle");
    }
  }
  const auth = useAuth();
  return (
    <Tr key={orgUser._id}>
      <Td>
        {status === "changing" ? (
          <Spinner size="sm" />
        ) : (
          <Switch
            title={
              auth.user._id === orgUser._id
                ? t("users.this_is_your_account")
                : t("users.deactivate")
            }
            isDisabled={auth.user._id === orgUser._id}
            onChange={(e) => {
              onChangeActiveUser(e.currentTarget.checked);
            }}
            isChecked={orgUser.active}
          />
        )}
      </Td>
      <Td>{orgUser.name}</Td>
      <Td>{orgUser.email}</Td>
      <Td textTransform={"capitalize"}>{orgUser.role}</Td>
    </Tr>
  );
}
