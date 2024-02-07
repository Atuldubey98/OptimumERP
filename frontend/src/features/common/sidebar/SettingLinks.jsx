import { Icon, List } from "@chakra-ui/react";
import React from "react";
import HeaderLink from "./HeaderLink";
import { NavLink } from "react-router-dom";
import settingsLinks from "../../../constants/settingsLinks";

export default function SettingLinks() {
  return (
    <List marginLeft={3} spacing={3}>
      {settingsLinks.map((setting) => (
        <HeaderLink key={setting.label}>
          <Icon as={setting.icon} />
          <NavLink to={setting.link}>{setting.label}</NavLink>
        </HeaderLink>
      ))}
    </List>
  );
}
