import { Avatar, Flex, Hide, Tag, Text } from "@chakra-ui/react";
import React, { useContext } from "react";
import SettingContext from "../../../contexts/SettingContext";
import useAuth from "../../../hooks/useAuth";
import useStorageUtil from "../../../hooks/useStorageUtil";
export default function AvatarProfile() {
  const { user } = useAuth();
  const settingContext = useContext(SettingContext);
  const role = settingContext?.role || "";
  const { getFileUrl } = useStorageUtil();
  const avatar = getFileUrl(user?.avatar);
  return (
    <Flex cursor={"cursor"} gap={2} alignItems={"center"}>
      <Hide below="md">
        <Flex justifyContent={"center"} alignItems={"center"} gap={2}>
          <Text noOfLines={1} fontWeight={"bold"}>
            {`${user?.name} `}{" "}
          </Text>
          <Tag colorScheme="teal">{role.toLocaleUpperCase()}</Tag>
        </Flex>
      </Hide>
      <Avatar size={"sm"} name={user?.name} src={avatar} />
    </Flex>
  );
}
