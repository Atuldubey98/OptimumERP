import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { GoOrganization } from "react-icons/go";
import SettingContext from "../../contexts/SettingContext";
export default function OrgItem({ org }) {
  const [status, setStatus] = useState("idle");
  const settingContext = useContext(SettingContext);
  const visitOrganizationDashboard = async () => {
    setStatus("loading");
    localStorage.setItem("organization", org._id);
    await settingContext.fetchSetting(org._id);
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
        <Text fontSize={"xs"} fontStyle={"italic"}>
          {org.address}
        </Text>
      </Box>
    </Flex>
  );
}
