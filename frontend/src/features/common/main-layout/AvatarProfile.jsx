import { Avatar, Flex, Text } from "@chakra-ui/react";
import React from "react";
import useAuth from "../../../hooks/useAuth";

export default function AvatarProfile({ toggleProfilePopup }) {
  const { user } = useAuth();

  return (
    <Flex
      cursor={toggleProfilePopup ? "cursor" : "default"}
      onClick={toggleProfilePopup}
      justifyContent={"flex-end"}
      gap={2}
      alignItems={"center"}
    >
      <Text>{user?.name}</Text>
      <Avatar name={user?.name} src="https://bit.ly/tioluwani-kolawole" />
    </Flex>
  );
}
