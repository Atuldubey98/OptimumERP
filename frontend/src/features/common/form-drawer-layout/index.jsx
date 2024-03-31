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
export default function FormDrawerLayout({
  children,
  formHeading,
  onClose,
  isOpen,
  formBtnLabel,
  handleFormSubmit,
  isSubmitting = false,
}) {
  return (
    <Drawer size={"md"} isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <form onSubmit={handleFormSubmit}>
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{formHeading}</DrawerHeader>
          <Divider />
          <DrawerBody>{children}</DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
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
