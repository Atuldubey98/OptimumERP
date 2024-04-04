import { Container, Icon, IconButton, List, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { NavLink, useParams } from "react-router-dom";
import headerLinks from "../../../constants/headerLinks";
import HeaderLink from "./HeaderLink";
import SettingLinks from "./SettingLinks";
import { SiAboutdotme } from "react-icons/si";
export const SidebarLinksList = () => {
  const [openSettings, setOpenSettings] = useState(false);
  const { orgId = localStorage.getItem("organization") || "" } = useParams();
  return (
    <Container marginBlock={3}>
      <List spacing={3}>
        {headerLinks.map((headerLink) => (
          <HeaderLink key={headerLink.label}>
            <Icon as={headerLink.icon} />
            <NavLink
              to={orgId ? `/${orgId}${headerLink.link}` : "/organizations"}
            >
              {headerLink.label}
            </NavLink>
          </HeaderLink>
        ))}
        <HeaderLink>
          <Icon as={IoSettingsOutline} />
          <Text>Settings</Text>
          <IconButton
            size={15}
            icon={openSettings ? <FaChevronUp /> : <FaChevronDown />}
            cursor={"pointer"}
            onClick={() => setOpenSettings(!openSettings)}
          />
        </HeaderLink>
        {openSettings ? <SettingLinks /> : null}
        <HeaderLink>
          <Icon as={SiAboutdotme} />
          <NavLink to={`/${orgId}/about`}>
            <Text>About</Text>
          </NavLink>
        </HeaderLink>
      </List>
    </Container>
  );
};
