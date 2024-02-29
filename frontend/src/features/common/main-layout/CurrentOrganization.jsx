import { Box, Heading } from "@chakra-ui/react";
import React, { useContext } from "react";
import SettingContext from "../../../contexts/SettingContext";
export default function CurrentOrganization() {
  const settingContext = useContext(SettingContext);
  const orgName = settingContext?.setting?.org.name;
  return (
    <Box p={3}>
      <Heading textAlign={"center"} fontSize={"lg"}>{orgName}</Heading>
    </Box>
  );
}
