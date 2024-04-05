import { List } from "@chakra-ui/react";
import React, { useContext } from "react";
import settingsLinks from "../../../constants/settingsLinks";
import SettingContext from "../../../contexts/SettingContext";
import HeaderLink from "./HeaderLink";
export default function SettingLinks() {
  const settingContext = useContext(SettingContext);
  const currentRole = settingContext.role || "";

  return (
    <List marginLeft={3} spacing={1}>
      {settingsLinks
        .filter(
          (setting) => setting.role === currentRole || currentRole === "admin"
        )
        .map((setting) => (
          <HeaderLink
            headerLink={{
              icon: setting.icon,
              label: setting.label,
              link: setting.link,
            }}
            key={setting.label}
          />
        ))}
    </List>
  );
}
