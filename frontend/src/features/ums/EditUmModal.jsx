import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Switch,
  Textarea,
} from "@chakra-ui/react";
import React from "react";
import useUmForm from "../../hooks/useUmForm";
import { useTranslation } from "react-i18next";

export default function EditUmModal({ isOpen, onClose, fetchUms }) {
  const { t } = useTranslation("um");
  const { formik } = useUmForm({
    fetchUms,
    onClose,
  });
  return (
    <Modal
      blockScrollOnMount={false}
      size={"xl"}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {formik.values._id
            ? t("um_ui.modal.edit_title")
            : t("um_ui.modal.add_title")}
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={formik.handleSubmit}>
          <ModalBody>
            <Stack spacing={2}>
              <FormControl isRequired>
                <FormLabel>{t("um_ui.form.name")}</FormLabel>
                <Input
                  required
                  name="name"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t("um_ui.form.short_form")}</FormLabel>
                <Input
                  required
                  name="unit"
                  onChange={formik.handleChange}
                  value={formik.values.unit}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t("um_ui.form.description")}</FormLabel>
                <Textarea
                  onChange={formik.handleChange}
                  name="description"
                  value={formik.values.description}
                />
              </FormControl>
              <FormControl gap={2} display="flex" alignItems="center">
                <Switch
                  onChange={formik.handleChange}
                  name="enabled"
                  isChecked={formik.values.enabled}
                />
                <FormLabel>{t("um_ui.form.enabled")}</FormLabel>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              {t("um_ui.modal.close")}
            </Button>
            <Button
              isLoading={formik.isSubmitting}
              type="submit"
              colorScheme="blue"
            >
              {t("um_ui.modal.save")}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
