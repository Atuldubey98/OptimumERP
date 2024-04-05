import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import React, { useContext } from "react";
import { GoOrganization } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import instance from "../../instance";
import { useState } from "react";
import SettingContext from "../../contexts/SettingContext";
export default function OrgItem({ org }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle");
  const settingContext = useContext(SettingContext);
  const visitOrganizationDashboard = async () => {
    setStatus("loading");
    const { data } = await instance.get(
      `/api/v1/organizations/${org._id}/settings`
    );
    if (settingContext.onSetSettingForOrganization) {
      settingContext.onSetSettingForOrganization(data.data);
      settingContext.onSetCurrentOrgRole(data.role);
    }
    navigate(`/${org._id}/dashboard`);
    localStorage.setItem("organization", org._id);
    setStatus("success");
  };
  const loading = status === "loading";
  return (
    <Flex
      borderRadius={4}
      padding={3}
      justifyContent={"flex-start"}
      gap={4}
      cursor={"pointer"}
      boxShadow={"md"}
      onClick={visitOrganizationDashboard}
      alignItems={"center"}
    >
      <GoOrganization size={34} />
      <Box>
        <Flex gap={3}>
          <Text fontWeight={"bold"}>{org.name}</Text>
          {loading ? <Spinner /> : null}
        </Flex>
        <Text fontSize={"sm"} fontStyle={"italic"}>
          {org.address}
        </Text>
      </Box>
    </Flex>
  );
}
