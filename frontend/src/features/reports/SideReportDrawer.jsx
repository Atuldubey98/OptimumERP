import React from "react";
import ReportTabs from "./ReportTabs";
import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerOverlay } from "@chakra-ui/react";

export default function SideReportDrawer({ isOpen, onClose }) {
  return (
    <Drawer  isOpen={isOpen} placement="left" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerBody>
          <ReportTabs />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
