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
  FormErrorMessage,
  FormLabel,
  Stack,
} from "@chakra-ui/react";
import React from "react";
import { Select } from "chakra-react-select";
import RegisterUserFields from "../register/RegisterUserFields";

export default function RegisteUserDrawer({ isOpen, onClose, formik }) {
  const roleOptions = [
    { value: "user", label: "User" },
    { value: "admin", label: "Admin" },
  ];
  return (
    <Drawer size={"md"} isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Register User</DrawerHeader>

        <form onSubmit={formik.handleSubmit}>
          <DrawerBody>
            <Stack spacing={4}>
              <FormControl isInvalid={formik.errors.role} isRequired>
                <FormLabel>User role</FormLabel>
                <Select
                  value={roleOptions.find(
                    (roleOption) => roleOption.value === formik.values.role
                  )}
                  onChange={({ value }) => {
                    formik.setFieldValue("role", value);
                  }}
                  options={roleOptions}
                />
                <FormErrorMessage>{formik.errors.role}</FormErrorMessage>
              </FormControl>
              <RegisterUserFields formik={formik} />
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
            <Button
              isLoading={formik.isSubmitting}
              type="submit"
              colorScheme="blue"
            >
              Register
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
