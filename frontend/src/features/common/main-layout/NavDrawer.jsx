import {
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useColorModeValue
} from "@chakra-ui/react";
import Banner from "../sidebar/Banner";
import { SidebarLinksList } from "../sidebar/SidebarLinksList";
import CurrentOrganization from "./CurrentOrganization";

export default function NavDrawer({ isOpen, onClose }) {
  const sidebarBg = useColorModeValue("gray.200", "gray.700");

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          <Banner />
        </DrawerHeader>
        <Divider />
        <CurrentOrganization />
        <Divider />
        <DrawerBody>
          <SidebarLinksList />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
