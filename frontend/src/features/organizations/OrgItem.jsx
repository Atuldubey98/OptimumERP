import { Box, Flex, Image, Spinner, Text, useColorModeValue } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { GoOrganization } from "react-icons/go";
import SettingContext from "../../contexts/SettingContext";
import useStorageUtil from "../../hooks/useStorageUtil";
export default function OrgItem({ org }) {
  const { t } = useTranslation(["org", "common"]);
  const [status, setStatus] = useState("idle");
  const settingContext = useContext(SettingContext);
  const visitOrganizationDashboard = async () => {
    setStatus("loading");
    localStorage.setItem("organization", org._id);
    await settingContext.fetchSetting(org._id);
    setStatus("success");
  };
  const loading = status === "loading";
  const { getFileUrl } = useStorageUtil();
  const logo = getFileUrl(org?.logo);
  const cardBg = useColorModeValue("white", "whiteAlpha.80");
  const borderColor = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const subtleText = useColorModeValue("gray.600", "gray.300");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  return (
    <Flex
      borderRadius={"xl"}
      padding={{ base: 4, md: 5 }}
      justifyContent={"flex-start"}
      gap={4}
      cursor={"pointer"}
      bg={cardBg}
      borderWidth={1}
      borderColor={borderColor}
      boxShadow={"md"}
      transition={"all 200ms ease"}
      _hover={{ transform: "translateY(-1px)", boxShadow: "xl" }}
      onClick={visitOrganizationDashboard}
      alignItems={"center"}
    >
      <Flex
        w={12}
        h={12}
        borderRadius={"xl"}
        borderWidth={1}
        borderColor={borderColor}
        alignItems={"center"}
        justifyContent={"center"}
        flexShrink={0}
      >
        {org?.logo ? (
          <Image src={logo} width={34} alt={org?.name} />
        ) : (
          <GoOrganization size={28} />
        )}
      </Flex>
      <Box flex={1} minW={0}>
        <Flex gap={3} alignItems={"center"} wrap={"wrap"}>
          <Text fontWeight={"bold"} noOfLines={1}>
            {org.name}
          </Text>
          {loading ? <Spinner /> : null}
        </Flex>
        <Text mt={1} fontSize={"sm"} color={subtleText} noOfLines={2}>
          {org.address}
        </Text>
        <Flex mt={3} gap={2} wrap={"wrap"}>
          <Text
            fontSize={"xs"}
            px={2.5}
            py={1}
            borderRadius={"full"}
            borderWidth={1}
            borderColor={borderColor}
            color={mutedText}
          >
            {t("common:common_ui.organizations.workspace")}
          </Text>
          <Text
            fontSize={"xs"}
            px={2.5}
            py={1}
            borderRadius={"full"}
            borderWidth={1}
            borderColor={borderColor}
            color={mutedText}
          >
            {t("common:common_ui.organizations.open_dashboard")}
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
}
