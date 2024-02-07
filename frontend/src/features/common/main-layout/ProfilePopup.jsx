import React from "react";
import { CiSettings } from "react-icons/ci";
import HeaderLink from "../sidebar/HeaderLink";
import { MdOutlineSettingsApplications } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";

import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../../../api/logout";
import useAsyncCall from "../../../hooks/useAsyncCall";
import { Box, Divider, Icon, List, Text, useToast } from "@chakra-ui/react";
export default function ProfilePopup() {
  const { requestAsyncHandler } = useAsyncCall();
  const navigate = useNavigate();
  const toast = useToast();
  const onClickLogout = requestAsyncHandler(async () => {
    const { data } = await logoutUser();
    toast({
      title: "Logout",
      description: data.message,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    navigate("/login", { replace: true });
  });
  return (
    <Box
      boxShadow={"md"}
      position={"absolute"}
      padding={4}
      zIndex={5}
      backgroundColor={"white"}
      right={4}
    >
      <List spacing={3}>
        <HeaderLink>
          <Icon as={CiSettings} />
          <Link to={"/profile-settings"}>Profile Settings</Link>
        </HeaderLink>
        <HeaderLink>
          <Icon as={MdOutlineSettingsApplications} />
          <Link to={"/app-settings"}>App Settings</Link>
        </HeaderLink>
        <Divider />
        <HeaderLink>
          <Icon color={"red"} as={IoIosLogOut} />
          <Text onClick={onClickLogout}>Logout</Text>
        </HeaderLink>
      </List>
    </Box>
  );
}
