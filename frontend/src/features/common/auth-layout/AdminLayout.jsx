import React, { useContext } from "react";
import SettingContext from "../../../contexts/SettingContext";
import { Flex, Heading } from "@chakra-ui/react";
import { RiAdminLine } from "react-icons/ri";

export default function AdminLayout({ children }) {
  const settingContext = useContext(SettingContext);
  const role = settingContext?.role || "";
  return role === "admin" ? (
    children
  ) : (
    <Flex
      minH={"50svh"}
      justifyContent={"center"}
      alignItems={"center"}
      flexDir={"column"}
    >
      <RiAdminLine size={80} color="lightgray" />
      <Heading noOfLines={1} color={"gray.300"} fontSize={"2xl"}>
        Admin rights required
      </Heading>
    </Flex>
  );
}
