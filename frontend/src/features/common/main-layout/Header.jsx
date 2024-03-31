import {
  Box,
  Button,
  Flex,
  IconButton,
  Show,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import { AiOutlineDashboard } from "react-icons/ai";
import { SiQuicktime } from "react-icons/si";
import { CiDark } from "react-icons/ci";
import { MdMenu, MdOutlineWbSunny } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import AvatarProfileWithOptions from "../sidebar/AvatarProfileWithOptions";
import QuickAccessModal from "../QuickAccessModal";
export default function Header({ onSideNavOpen }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const {
    isOpen: isQuickAccessOpen,
    onClose: closeQuickAccess,
    onOpen: openQuickAccess,
  } = useDisclosure();
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
            size={"sm"}
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
          <Button
            size={"sm"}
            colorScheme="blue"
            onClick={openQuickAccess}
            variant="outline"
          >
            <SiQuicktime />
            <Show above="xl">
              <Text marginLeft={3}>Quick Access</Text>
            </Show>
          </Button>
          <IconButton
          size={"sm"}
            icon={colorMode === "dark" ? <MdOutlineWbSunny /> : <CiDark />}
            onClick={toggleColorMode}
          />
          {/* {colorMode === "dark" ? (
            <MdOutlineWbSunny
              onClick={toggleColorMode}
              size={28}
              cursor={"pointer"}
            />
          ) : (
            <CiDark onClick={toggleColorMode} size={28} cursor={"pointer"} />
          )} */}
          <Show below="xl">
            <AvatarProfileWithOptions />
            <MdMenu size={28} cursor={"pointer"} onClick={onSideNavOpen} />
          </Show>
        </Flex>
      </Box>
      <QuickAccessModal isOpen={isQuickAccessOpen} onClose={closeQuickAccess} />
    </Box>
  );
}
