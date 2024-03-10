import {
  Box,
  Button,
  Flex,
  Show,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";

import { CiDark } from "react-icons/ci";
import { IoIosLogOut } from "react-icons/io";
import { MdMenu, MdOutlineWbSunny } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../api/logout";
import useAsyncCall from "../../../hooks/useAsyncCall";
import AlertModal from "../AlertModal";
import AvatarProfile from "./AvatarProfile";
import useAuth from "../../../hooks/useAuth";
import { GoArrowSwitch } from "react-icons/go";
export default function Header({ onSideNavOpen }) {
  const onNavigateToOrganizations = () => navigate("/organizations");
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { requestAsyncHandler } = useAsyncCall();
  const navigate = useNavigate();
  const toast = useToast();
  const [status, setStatus] = useState("idle");
  const authContext = useAuth();
  const onClickLogout = requestAsyncHandler(async () => {
    setStatus("loggingOut");
    const { data } = await logoutUser();
    toast({
      title: "Logout",
      description: data.message,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    navigate("/login", { replace: true });
    setStatus("idle");
    if (authContext.onSetCurrentUser) authContext.onSetCurrentUser(null);
    localStorage.removeItem("organization");
  });
  const loggingOut = status === "loggingOut";
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
            leftIcon={<GoArrowSwitch />}
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
          <AvatarProfile />
          <Button
            leftIcon={<IoIosLogOut />}
            onClick={onOpen}
            colorScheme="red"
            variant="solid"
          >
            Logout
          </Button>
          <Show below="xl">
            <MdMenu size={28} cursor={"pointer"} onClick={onSideNavOpen} />
          </Show>
        </Flex>
      </Box>
      <AlertModal
        confirmDisable={loggingOut}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onClickLogout}
        body={"Do you want to logout ?"}
        header={"Logout"}
        buttonLabel="Logout"
      />
    </Box>
  );
}
