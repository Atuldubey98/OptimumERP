import { Avatar, Box, Grid, Heading, useColorModeValue } from "@chakra-ui/react";
import { useContext } from "react";
import { GoOrganization } from "react-icons/go";
import SettingContext from "../../../contexts/SettingContext";
import useStorageUtil from "../../../hooks/useStorageUtil";

export default function CurrentOrganization() {
  const settingContext = useContext(SettingContext);
  const orgName = settingContext?.setting?.org.name;
  const { getFileUrl } = useStorageUtil();
  const logo = getFileUrl(settingContext?.setting?.org?.logo);
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box p={3} w="100%" px={4}>
      <Grid
        gap={3}
        gridTemplateColumns={"auto 1fr"}
        justifyContent={"flex-start"}
        alignItems={"center"}
      >
        {logo ? (
          <Avatar
            size="sm"
            borderRadius="md"
            src={logo}
            name={orgName}
            bg="transparent"
            borderWidth="1px"
            borderColor={borderColor}
          />
        ) : (
          <Avatar
            size="sm"
            borderRadius="md"
            icon={<GoOrganization size={18} />}
            bg={useColorModeValue("blue.50", "blue.900")}
            color={useColorModeValue("blue.600", "blue.200")}
          />
        )}
        <Heading noOfLines={2} textAlign={"left"} fontSize={"xs"} fontWeight={"semibold"}>
          {orgName}
        </Heading>
      </Grid>
    </Box>
  );
}

