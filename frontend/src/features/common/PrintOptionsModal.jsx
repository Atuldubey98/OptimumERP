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
export default function PrintOptionsModal({ isOpen, onClose, entity, url }) {
  const printOptions = {
    party: {
      fields: {
        name: "Name",
        billingAddress: "Billing address",
        shippingAddress: "Shipping Address",
        gstNo: "GST No.",
        panNo: "PAN No.",
        createdBy: "Created By",
        createdAt: "Created At",
        updatedAt: "Updated At",
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
          <ModalHeader>Print Options</ModalHeader>
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
              Close
            </Button>
            <Button
              size={"sm"}
              colorScheme="blue"
              isDisabled={!selectedOptions.length}
              leftIcon={<SiMicrosoftexcel />}
            >
              Export
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
}
