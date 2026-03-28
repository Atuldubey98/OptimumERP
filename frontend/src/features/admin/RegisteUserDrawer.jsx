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
import { useTranslation } from "react-i18next";
import RegisterUserFields from "../register/RegisterUserFields";

export default function RegisteUserDrawer({ isOpen, onClose, formik }) {
  const { t } = useTranslation("admin");
  const roleOptions = [
    { value: "user", label: t("drawer.roles.user") },
    { value: "admin", label: t("drawer.roles.admin") },
  ];
  return (
    <Drawer size={"md"} isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>{t("drawer.register_user")}</DrawerHeader>

        <form onSubmit={formik.handleSubmit}>
          <DrawerBody>
            <Stack spacing={4}>
              <FormControl isInvalid={formik.errors.role} isRequired>
                <FormLabel>{t("drawer.user_role")}</FormLabel>
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
                {t("drawer.is_user_active")}
              </Checkbox>
              <Checkbox
                isChecked={formik.values.useAdminSMTP}
                onChange={formik.handleChange}
                colorScheme="green"
                name="useAdminSMTP"
                defaultChecked
              >
                {t("drawer.can_use_my_smtp")}
              </Checkbox>
            </Stack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              {t("actions.cancel")}
            </Button>
            <Button
              isLoading={formik.isSubmitting}
              type="submit"
              colorScheme="blue"
            >
              {t("actions.register")}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
