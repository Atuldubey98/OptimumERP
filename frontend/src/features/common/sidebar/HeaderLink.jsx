import { ListItem, useColorModeValue, Flex, Icon, Box } from "@chakra-ui/react";
import React from "react";
import { NavLink, useParams } from "react-router-dom";
export default function HeaderLink({ headerLink }) {
  const { orgId } = useParams();
  const bg = useColorModeValue("gray.200", "gray.600");

  return (
    <ListItem key={headerLink.label}>
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
            <Box fontWeight={isActive ? "bold" : "400"}>{headerLink.label}</Box>
          </Flex>
        )}
      </NavLink>
    </ListItem>
  );
}
