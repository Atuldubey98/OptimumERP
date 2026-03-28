import React, { useContext } from "react";
import SettingContext from "../../../contexts/SettingContext";
import { Flex, Heading } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { RiAdminLine } from "react-icons/ri";

export default function AdminLayout({ children }) {
  const settingContext = useContext(SettingContext);
  const role = settingContext?.role || "";
  const { t } = useTranslation("common");
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
        {t("auth_layout.admin_rights_required")}
      </Heading>
    </Flex>
  );
}
