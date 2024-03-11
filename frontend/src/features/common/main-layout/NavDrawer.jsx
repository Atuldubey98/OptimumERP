import {
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/react";
import Banner from "../sidebar/Banner";
import { SidebarLinksList } from "../sidebar/SidebarLinksList";
import CurrentOrganization from "./CurrentOrganization";
import AvatarProfileWithOptions from "../sidebar/AvatarProfileWithOptions";

export default function NavDrawer({ isOpen, onClose }) {
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
