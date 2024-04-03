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
  const onClickDashboard = () => {
    navigate(
      localStorage.getItem("organization")
        ? `/${(localStorage.getItem("organization") || "") + "/dashboard"}`
        : "/organizations"
    );
  };
  return (
    <Box width={"100%"}>
      <Box position={"relative"}>
        <Flex
          flexWrap={"wrap"}
          justifyContent={"flex-end"}
          gap={5}
          alignItems={"center"}
        >
          <Show above="xl">
            <Button
              leftIcon={<SiQuicktime />}
              size={"sm"}
              colorScheme="blue"
              onClick={openQuickAccess}
              variant="outline"
            >
              Quick Access
            </Button>
          </Show>
          <Show above="xl">
            <Button
              leftIcon={<AiOutlineDashboard />}
              size={"sm"}
              colorScheme="blue"
              onClick={onClickDashboard}
              variant="outline"
            >
              Dashboard
            </Button>
          </Show>
          <IconButton
            size={"sm"}
            icon={<AiOutlineDashboard />}
            onClick={onClickDashboard}
          />
          <Show below="xl">
            <IconButton
              size={"sm"}
              icon={<SiQuicktime />}
              onClick={openQuickAccess}
            />
          </Show>
          <Show below="xl">
            <IconButton
              size={"sm"}
              icon={colorMode === "dark" ? <MdOutlineWbSunny /> : <CiDark />}
              onClick={toggleColorMode}
            />
          </Show>

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
