import { Box, Container, Icon, IconButton, List, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { NavLink, useLocation, useParams } from "react-router-dom";
import headerLinks from "../../../constants/headerLinks";
import HeaderLink from "./HeaderLink";
import SettingLinks from "./SettingLinks";
import { SiAboutdotme } from "react-icons/si";
import { TbCategory } from "react-icons/tb";
import settingsLinks from "../../../constants/settingsLinks";
export const SidebarLinksList = () => {
  const {
    orgId = localStorage.getItem("organization") || "",
    type = "expense",
  } = useParams();
  const location = useLocation();
  const [openSettings, setOpenSettings] = useState(
    settingsLinks
      .map((settingLink) => `/${orgId}${settingLink.link}`)
      .includes(location.pathname)
  );

  return (
    <Container marginBlock={3}>
      <List spacing={3}>
        {headerLinks.map((headerLink) => (
          <HeaderLink key={headerLink.label}>
            <Icon as={headerLink.icon} />
            <NavLink
              to={orgId ? `/${orgId}${headerLink.link}` : "/organizations"}
            >
              {({ isActive }) => (
                <Box fontWeight={isActive ? "bold" : "400"}>
                  {headerLink.label}
                </Box>
              )}
            </NavLink>
          </HeaderLink>
        ))}
        <HeaderLink>
          <Icon as={TbCategory} />
          <NavLink to={`/${orgId}/categories/${type}`}>
            {({ isActive }) => (
              <Box fontWeight={isActive ? "bold" : "400"}>Categories</Box>
            )}
          </NavLink>
        </HeaderLink>
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
            {({ isActive }) => (
              <Box fontWeight={isActive ? "bold" : "400"}>About</Box>
            )}
          </NavLink>
        </HeaderLink>
      </List>
    </Container>
  );
};
