import { Box, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { GoOrganization } from "react-icons/go";
import { useNavigate } from "react-router-dom";

export default function OrgItem({ org }) {
  const navigate = useNavigate();
  const visitOrganizationDashboard = () => {
    navigate(`/${org._id}/dashboard`);
  };
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
        <Text fontSize={"2xl"} fontWeight={"bold"}>
          {org.name}
        </Text>
        <Text fontSize={"sm"} fontStyle={"italic"}>
          {org.address}
        </Text>
      </Box>
    </Flex>
  );
}
