import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay } from "@chakra-ui/react";
import { SidebarLinksList } from "../sidebar/SidebarLinksList";
import Banner from "../sidebar/Banner";

export default function NavDrawer({ isOpen, onClose }) {
  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          <Banner />
        </DrawerHeader>

        <DrawerBody>
          <SidebarLinksList />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
