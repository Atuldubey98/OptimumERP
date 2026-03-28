import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";

export default function FormModalWrapper({
  isOpen,
  onClose,
  children,
  handleSubmit,
  heading = "Modal title",
  isSubmitting=false
}) {
  const { t } = useTranslation("user");
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <ModalHeader>{heading}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{children}</ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              {t("user_ui.form_modal.close_button")}
            </Button>
            <Button
              isLoading={isSubmitting}
              type="submit"
              colorScheme="blue"
            >
              {t("user_ui.form_modal.submit_button")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
}
