import { Box, Flex, Grid, Heading } from "@chakra-ui/react";
import React, { useContext } from "react";
import SettingContext from "../../../contexts/SettingContext";
import { GoOrganization } from "react-icons/go";
export default function CurrentOrganization() {
  const settingContext = useContext(SettingContext);
  const orgName = settingContext?.setting?.org.name;
  return (
    <Box p={3}>
      <Grid
        gap={3}
        gridTemplateColumns={"auto 1fr"}
        justifyContent={"flex-start"}
        alignItems={"center"}
      >
        <GoOrganization size={30} />
        <Heading noOfLines={2} textAlign={"center"} fontSize={"lg"}>
          {orgName}
        </Heading>
      </Grid>
    </Box>
  );
}
