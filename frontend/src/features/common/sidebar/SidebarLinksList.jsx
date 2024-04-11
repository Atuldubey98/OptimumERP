import {
  Container,
  Flex,
  Icon,
  IconButton,
  List,
  ListItem,
  Text
} from "@chakra-ui/react";
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { IoSettingsOutline } from "react-icons/io5";
import { SiAboutdotme } from "react-icons/si";
import { TbCategory } from "react-icons/tb";
import { useLocation, useParams } from "react-router-dom";
import headerLinks from "../../../constants/headerLinks";
import settingsLinks from "../../../constants/settingsLinks";
import HeaderLink from "./HeaderLink";
import SettingLinks from "./SettingLinks";
export const SidebarLinksList = () => {
  const {
    orgId = localStorage.getItem("organization") || "",
    type = "expense",
    reportType = "sale",
  } = useParams();
  const location = useLocation();
  const [openSettings, setOpenSettings] = useState(
    settingsLinks
      .map((settingLink) => `/${orgId}${settingLink.link}`)
      .includes(location.pathname)
  );

  return (
    <Container p={0} height={"100%"} overflowY={"auto"}>
      <List spacing={1}>
        {headerLinks.map((headerLink) => (
          <HeaderLink headerLink={headerLink} key={headerLink.link} />
        ))}
        <HeaderLink
          headerLink={{
            icon: TbCategory,
            link: `/categories/${type}`,
            label: "Categories",
          }}
        />
        <HeaderLink
          headerLink={{
            icon: HiOutlineDocumentReport,
            link: `/reports/${reportType}`,
            label: "Reports",
          }}
        />
        <ListItem>
          <Flex
            p={1}
            paddingInline={2}
            justifyContent={"flex-start"}
            alignItems={"center"}
            gap={2}
          >
            <Icon as={IoSettingsOutline} />
            <Text>Settings</Text>
            <IconButton
              size={15}
              icon={openSettings ? <FaChevronUp /> : <FaChevronDown />}
              cursor={"pointer"}
              onClick={() => setOpenSettings(!openSettings)}
            />
          </Flex>
        </ListItem>
        {openSettings ? <SettingLinks /> : null}
        <HeaderLink
          headerLink={{
            icon: SiAboutdotme,
            link: `/about`,
            label: "About",
          }}
        />
      </List>
    </Container>
  );
};
