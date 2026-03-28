import React from "react";
import { CiSettings } from "react-icons/ci";
import HeaderLink from "../sidebar/HeaderLink";
import { MdOutlineSettingsApplications } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { useTranslation } from "react-i18next";

import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../../../api/logout";
import useAsyncCall from "../../../hooks/useAsyncCall";
import { Box, Divider, Icon, List, Text, useToast } from "@chakra-ui/react";
export default function ProfilePopup() {
  const { t } = useTranslation("common");

  return (
    <Box
      boxShadow={"md"}
      position={"absolute"}
      padding={4}
      zIndex={5}
      right={4}
    >
      <List spacing={3}>
        <HeaderLink>
          <Icon as={CiSettings} />
          <Link to={"/profile-settings"}>
            {t("common_ui.profile.profile_settings")}
          </Link>
        </HeaderLink>
        <HeaderLink>
          <Icon as={MdOutlineSettingsApplications} />
          <Link to={"/app-settings"}>{t("common_ui.profile.app_settings")}</Link>
        </HeaderLink>
        <Divider />
        <HeaderLink>
          <Icon color={"red"} as={IoIosLogOut} />
          <Text>{t("common_ui.actions.logout")}</Text>
        </HeaderLink>
      </List>
    </Box>
  );
}
