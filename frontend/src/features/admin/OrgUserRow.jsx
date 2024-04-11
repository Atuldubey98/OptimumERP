import React, { useState } from "react";
import { Tr, Td, Switch, useToast, Spinner, Tooltip } from "@chakra-ui/react";
import instance from "../../instance";
import { isAxiosError } from "axios";
import useAuth from "../../hooks/useAuth";
export default function OrgUserRow({ orgUser, fetchUsers, organization }) {
  const [status, setStatus] = useState("idle");
  const toast = useToast();
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
        title: "Success",
        description: data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchUsers(organization);
    } catch (error) {
      toast({
        title: "Error",
        description: isAxiosError(error)
          ? error.response.data.message
          : "Error occured",
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
                ? "This is your account"
                : "Deactivate"
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
