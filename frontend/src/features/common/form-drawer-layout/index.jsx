import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";
export default function FormDrawerLayout({
  children,
  formHeading,
  onClose,
  isOpen,
  formBtnLabel,
  handleFormSubmit,
  isSubmitting = false,
}) {
  const { t } = useTranslation("common");

  return (
    <Drawer blockScrollOnMount={false} size={"md"} isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <form onSubmit={handleFormSubmit}>
        <DrawerContent overflowY={"auto"}>
          <DrawerCloseButton />
          <DrawerHeader>{formHeading}</DrawerHeader>
          <Divider />
          <DrawerBody>{children}</DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              {t("common_ui.actions.cancel")}
            </Button>
            <Button isLoading={isSubmitting} type="submit" colorScheme="blue">
              {formBtnLabel}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </form>
    </Drawer>
  );
}
