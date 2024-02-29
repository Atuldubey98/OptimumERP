import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import React from "react";
import RegisterUserFields from "../register/RegisterUserFields";

export default function RegisteUserDrawer({ isOpen, onClose, formik }) {
  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Register User</DrawerHeader>

        <form onSubmit={formik.handleSubmit}>
          <DrawerBody>
            <RegisterUserFields formik={formik} />
            <FormControl isRequired mt={4}>
              <FormLabel>User role</FormLabel>
              <Select
                value={formik.values.role}
                onChange={formik.handleChange}
                name="role"
              >
                <option value={"user"}>User</option>
                <option value={"admin"}>Admin</option>
              </Select>
            </FormControl>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" colorScheme="blue">
              Register
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
