import {
  Button,
  ButtonGroup,
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay
} from "@chakra-ui/react";
import React, { useState } from "react";
import { LiaCaretLeftSolid, LiaCaretRightSolid } from "react-icons/lia";
import dashboard from "../../assets/dashboard.png";
import TourGuide from "./TourGuide";
export default function GuideTourModal({ isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const onNextTab = () => setCurrentIndex((prev) => ++prev);
  const onPreviousTab = () => setCurrentIndex((prev) => --prev);

  const tabs = [
    {
      label: "Dashboard",
      description: "Get an overview of your business metrics.",
    },
    {
      label: "Stats",
      description: "View detailed analytics and performance insights.",
    },
    {
      label: "Parties",
      description: "Manage your business contacts and suppliers.",
    },
    {
      label: "Contacts",
      description: "Organize your contacts for better communication.",
    },
    {
      label: "Invoices",
      description: "Create and manage invoices efficiently.",
    },
    {
      label: "Proforma Invoices",
      description: "Create and manage proforma invoices.",
    },
    {
      label: "Purchase Orders",
      description: "Create and track purchase orders.",
    },
    {
      label: "Quotations",
      description: "Generate and manage quotations.",
    },
    {
      label: "Purchases",
      description: "Simplify procurement and vendor management.",
    },
    {
      label: "Expenses",
      description: "Track and control business expenses.",
    },
    {
      label: "Items",
      description: "Organize and categorize your inventory.",
    },
    {
      label: "Reports",
      description: "Generate reports for data-driven decisions.",
    },
    {
      label: "Admin",
      description: "Configure advanced settings and user permissions.",
    },
  ];
  const guide = tabs[currentIndex];
  return (
    <Modal
      size={"3xl"}
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Welcome to OptimumERP!</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <TourGuide
            description={guide.description}
            imgSrc={dashboard}
            label={guide.label}
          />
        </ModalBody>
        <Divider />
        <ModalFooter>
          <ButtonGroup>
            {currentIndex === 0 ? null : (
              <Button
                leftIcon={<LiaCaretLeftSolid />}
                onClick={onPreviousTab}
                mr={3}
              >
                Previous
              </Button>
            )}
            {tabs.length - 1 === currentIndex ? null : (
              <Button rightIcon={<LiaCaretRightSolid />} onClick={onNextTab}>
                Next
              </Button>
            )}
            {tabs.length - 1 === currentIndex ? (
              <Button onClick={onClose} colorScheme="blue">
                Finish
              </Button>
            ) : null}
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
