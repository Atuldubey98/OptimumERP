import { Avatar, Flex, Hide, Text } from "@chakra-ui/react";
import React, { useContext } from "react";
import SettingContext from "../../../contexts/SettingContext";
import useAuth from "../../../hooks/useAuth";
export default function AvatarProfile() {
  const { user } = useAuth();
  const settingContext = useContext(SettingContext);
  const role = settingContext?.role || "";
  return (
    <Flex cursor={"cursor"} gap={2} alignItems={"center"}>
      <Hide below="md">
        <Text noOfLines={1} fontWeight={"bold"}>{`${
          user?.name
        } (${role.toLocaleUpperCase()})`}</Text>
      </Hide>
      <Avatar size={"sm"} name={user?.name} src={user?.avatar} />
    </Flex>
  );
}
