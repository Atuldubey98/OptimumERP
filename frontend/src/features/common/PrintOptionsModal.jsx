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
import { Select } from "chakra-react-select";
import { SiMicrosoftexcel } from "react-icons/si";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
export default function PrintOptionsModal({ isOpen, onClose, entity, url }) {
  const { t } = useTranslation("common");

  const printOptions = {
    party: {
      fields: {
        name: t("common_ui.print_options.fields.name"),
        billingAddress: t("common_ui.print_options.fields.billing_address"),
        shippingAddress: t("common_ui.print_options.fields.shipping_address"),
        gstNo: t("common_ui.print_options.fields.gst_no"),
        panNo: t("common_ui.print_options.fields.pan_no"),
        createdBy: t("common_ui.print_options.fields.created_by"),
        createdAt: t("common_ui.print_options.fields.created_at"),
        updatedAt: t("common_ui.print_options.fields.updated_at"),
      },
      default: ["name", "billingAddress", "gstNo", "panNo"],
    },
  };
  const options = Object.entries(printOptions[entity].fields).map(
    ([value, label]) => ({
      value,
      label,
    })
  );
  const defaultOptions = printOptions[entity].default.map((value) => ({
    value,
    label: printOptions[entity].fields[value],
  }));
  const [selectedOptions, setSelectedOptions] = useState(defaultOptions);
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <form>
        <ModalContent>
          <ModalHeader>{t("common_ui.print_options.title")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Select
              value={selectedOptions}
              options={options}
              isMulti
              onChange={setSelectedOptions}
            />
          </ModalBody>

          <ModalFooter>
            <Button mr={3} size={"sm"} onClick={onClose}>
              {t("common_ui.actions.close")}
            </Button>
            <Button
              size={"sm"}
              colorScheme="blue"
              isDisabled={!selectedOptions.length}
              leftIcon={<SiMicrosoftexcel />}
            >
              {t("common_ui.actions.export")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
}
