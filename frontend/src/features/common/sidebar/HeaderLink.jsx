import { ListItem, useColorModeValue, Flex, Icon, Box } from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useParams } from "react-router-dom";
export default function HeaderLink({ headerLink }) {
  const { orgId } = useParams();
  const bg = useColorModeValue("gray.300", "gray.600");
  const { t } = useTranslation("common");
  const resolvedLabel = headerLink.labelKey
    ? t(headerLink.labelKey, { defaultValue: headerLink.label || "" })
    : headerLink.label;

  return (
    <ListItem key={headerLink.link}>
      <NavLink to={orgId ? `/${orgId}${headerLink.link}` : "/organizations"}>
        {({ isActive }) => (
          <Flex
            p={2}
            paddingInline={2}
            bg={isActive && bg}
            justifyContent={"flex-start"}
            alignItems={"center"}
            gap={2}
          >
            <Icon as={headerLink.icon} />
            <Box fontWeight={isActive ? "bold" : "400"}>{resolvedLabel}</Box>
          </Flex>
        )}
      </NavLink>
    </ListItem>
  );
}
