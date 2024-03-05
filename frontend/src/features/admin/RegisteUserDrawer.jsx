import {
  Button,
  Checkbox,
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
  Stack,
} from "@chakra-ui/react";
import React from "react";
import RegisterUserFields from "../register/RegisterUserFields";

export default function RegisteUserDrawer({ isOpen, onClose, formik }) {
  return (
    <Drawer size={"md"} isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Register User</DrawerHeader>

        <form onSubmit={formik.handleSubmit}>
          <DrawerBody>
            <Stack spacing={4}>
              <RegisterUserFields formik={formik} />
              <FormControl isRequired>
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
              <Checkbox
                isChecked={formik.values.active}
                onChange={formik.handleChange}
                colorScheme="green"
                defaultChecked
              >
                Is the user active ?
              </Checkbox>
            </Stack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button isLoading={formik.isSubmitting} type="submit" colorScheme="blue">
              Register
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
