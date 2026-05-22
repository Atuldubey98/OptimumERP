import {
  Container,
  Divider,
  Flex,
  Icon,
  List,
  ListItem,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiChevronDown, FiChevronRight, FiMessageSquare } from "react-icons/fi";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { TbCategory } from "react-icons/tb";
import { useLocation, useParams } from "react-router-dom";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { LiaMoneyBillWaveAltSolid } from "react-icons/lia";
import { SiAboutdotme } from "react-icons/si";
import { mainLinks, purchaseLinks, masterLinks, analyticLinks, accountingLinks } from "../../../constants/headerLinks";
import settingsLinks from "../../../constants/settingsLinks";
import saleLinks from "../../../constants/saleLinks";
import HeaderLink from "./HeaderLink";
import SettingLinks from "./SettingLinks";
import SaleLinks from "./SaleLinks";
import useAuth from "../../../hooks/useAuth";

export const SidebarLinksList = ({ onClose }) => {
  const { t } = useTranslation("common");
  const {
    orgId = localStorage.getItem("organization") || "",
    type = "expense",
    reportType = "sale",
  } = useParams();
  const location = useLocation();
  const [openSettings, setOpenSettings] = useState(
    settingsLinks
      .map((settingLink) => `/${orgId}${settingLink.link}`)
      .includes(location.pathname),
  );
  const [openSale, setOpenSale] = useState(
    saleLinks
      .map((saleLink) => `/${orgId}${saleLink.link}`)
      .includes(location.pathname),
  );
  const { user } = useAuth();
  const currentFeatures = user?.features || {};
  const bot = currentFeatures?.bot ?? false;
  const bg = useColorModeValue("black");

  const renderLinks = (links) => {
    return links
      .filter(link => link.feature ? currentFeatures[link.feature] : true)
      .map((link) => <HeaderLink headerLink={link} key={link.link} />);
  };

  return (
    <Container p={0} height={"100%"} overflowY={"auto"}>
      <List onClick={onClose} spacing={1}>
        {renderLinks(mainLinks)}
        <Divider bg={bg} />


        <ListItem
          cursor={"pointer"}
          onClick={() => setOpenSale(!openSale)}
        >
          <Flex p={1} paddingInline={2} justifyContent={"flex-start"} alignItems={"center"} gap={2}>
            <Flex w={"100%"} justifyContent={"flex-start"} gap={9} alignItems={"center"}>
              <Flex gap={2} justifyContent={"center"} alignItems={"center"}>
                <Icon as={FaFileInvoiceDollar} />
                <Text>{t("common_ui.sidebar.sale")}</Text>
              </Flex>
            </Flex>
            {openSale ? <FiChevronDown /> : <FiChevronRight />}
          </Flex>
        </ListItem>
        {openSale ? <SaleLinks /> : null}
        <Divider bg={bg} />


        {renderLinks(purchaseLinks)}
        <Divider bg={bg} />


        {renderLinks(accountingLinks)}
        <Divider bg={bg} />


        {renderLinks(masterLinks)}
        <HeaderLink
          headerLink={{
            icon: TbCategory,
            link: `/categories/${type}`,
            labelKey: "common_ui.sidebar.categories",
          }}
        />
        <Divider bg={bg} />


        {renderLinks(analyticLinks)}
        <HeaderLink
          headerLink={{
            icon: HiOutlineDocumentReport,
            link: `/reports/${reportType}`,
            labelKey: "common_ui.sidebar.reports",
          }}
        />
        <Divider bg={bg} />


        {bot && (
          <HeaderLink
            headerLink={{
              icon: FiMessageSquare,
              link: "/conversations",
              labelKey: "common_ui.sidebar.links.conversations",
            }}
          />
        )}
        <ListItem
          cursor={"pointer"}
          onClick={() => setOpenSettings(!openSettings)}
        >
          <Flex p={1} paddingInline={2} justifyContent={"flex-start"} alignItems={"center"} gap={2}>
            <Flex w={"100%"} justifyContent={"flex-start"} gap={9} alignItems={"center"}>
              <Flex gap={2} justifyContent={"center"} alignItems={"center"}>
                <Icon as={IoSettingsOutline} />
                <Text>{t("common_ui.sidebar.settings")}</Text>
              </Flex>
            </Flex>
            {openSettings ? <FiChevronDown /> : <FiChevronRight />}
          </Flex>
        </ListItem>
        {openSettings ? <SettingLinks /> : null}
        <Divider bg={bg} />

        <HeaderLink
          headerLink={{
            icon: LiaMoneyBillWaveAltSolid,
            link: `/pricings`,
            labelKey: "common_ui.sidebar.plans",
          }}
        />
        <HeaderLink
          headerLink={{
            icon: SiAboutdotme,
            link: `/about`,
            labelKey: "common_ui.sidebar.about",
          }}
        />
      </List>
    </Container>
  );
};
