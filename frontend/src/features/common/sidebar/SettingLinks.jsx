import { Icon, List } from "@chakra-ui/react";
import React, { useContext } from "react";
import HeaderLink from "./HeaderLink";
import { NavLink, useParams } from "react-router-dom";
import settingsLinks from "../../../constants/settingsLinks";
import SettingContext from "../../../contexts/SettingContext";
export default function SettingLinks() {
  const settingContext = useContext(SettingContext);
  const currentRole = settingContext.role || "";
  const { orgId } = useParams();
  return (
    <List marginLeft={3} spacing={3}>
      {settingsLinks
        .filter(
          (setting) => setting.role === currentRole || currentRole === "admin"
        )
        .map((setting) => (
          <HeaderLink key={setting.label}>
            <Icon as={setting.icon} />
            <NavLink to={`/${orgId}${setting.link}`}>{setting.label}</NavLink>
          </HeaderLink>
        ))}
    </List>
  );
}
