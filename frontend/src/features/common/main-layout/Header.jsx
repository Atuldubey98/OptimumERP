import { Box, Button, Flex, Show, Text, useColorMode } from "@chakra-ui/react";
import React from "react";
import { AiOutlineDashboard } from "react-icons/ai";

import { CiDark } from "react-icons/ci";
import { MdMenu, MdOutlineWbSunny } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import AvatarProfileWithOptions from "../sidebar/AvatarProfileWithOptions";
export default function Header({ onSideNavOpen }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();

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
            onClick={() => {
              navigate(
                localStorage.getItem("organization")
                  ? `/${
                      (localStorage.getItem("organization") || "") +
                      "/dashboard"
                    }`
                  : "/organizations"
              );
            }}
            variant="outline"
          >
            <AiOutlineDashboard />
            <Show above="xl">
              <Text marginLeft={3}>Dashboard</Text>
            </Show>
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
          <Show below="xl">
            <AvatarProfileWithOptions />
            <MdMenu size={28} cursor={"pointer"} onClick={onSideNavOpen} />
          </Show>
        </Flex>
      </Box>
    </Box>
  );
}
