import {
  Container,
  Divider,
  Flex,
  Icon,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { IoSettingsOutline } from "react-icons/io5";
import { LiaMoneyBillWaveAltSolid } from "react-icons/lia";
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
        <Divider />
        <ListItem
          cursor={"pointer"}
          onClick={() => setOpenSettings(!openSettings)}
        >
          <Flex
            p={1}
            paddingInline={2}
            justifyContent={"flex-start"}
            alignItems={"center"}
            gap={2}
          >
            <Flex
              w={"100%"}
              justifyContent={"flex-start"}
              gap={9}
              alignItems={"center"}
            >
              <Flex gap={2} justifyContent={"center"} alignItems={"center"}>
                <Icon as={IoSettingsOutline} />
                <Text>Settings</Text>
              </Flex>
            </Flex>
            {openSettings ? <FiChevronDown /> : <FiChevronRight />}
          </Flex>
        </ListItem>
        {openSettings ? <SettingLinks /> : null}
        <Divider />
        <HeaderLink
          headerLink={{
            icon: LiaMoneyBillWaveAltSolid,
            link: `/pricings`,
            label: "Plans",
          }}
        />
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
