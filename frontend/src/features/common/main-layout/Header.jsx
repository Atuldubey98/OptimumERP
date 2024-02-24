import { Box, Button, Flex, Show, useColorMode } from "@chakra-ui/react";
import React from "react";

import { CiDark } from "react-icons/ci";
import { MdMenu, MdOutlineWbSunny } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import AvatarProfile from "./AvatarProfile";
export default function Header({ onSideNavOpen }) {
  const navigate = useNavigate();
  const onNavigateToOrganizations = () => navigate("/organizations");
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Box width={"100%"}>
      <Box position={"relative"}>
        <Flex
          flexWrap={"wrap"}
          justifyContent={"flex-end"}
          gap={5}
          alignItems={"center"}
        >
          <Button
            colorScheme="blue"
            onClick={onNavigateToOrganizations}
            variant="outline"
          >
            Switch Organization
          </Button>
          {colorMode === "dark" ? (
            <MdOutlineWbSunny
              onClick={toggleColorMode}
              size={28}
              cursor={"pointer"}
            />
          ) : (
            <CiDark onClick={toggleColorMode} size={28} cursor={"pointer"} />
          )}
          <AvatarProfile/>
          <Show below="md">
            <MdMenu size={28} cursor={"pointer"} onClick={onSideNavOpen} />
          </Show>
        </Flex>
      </Box>
    </Box>
  );
}
