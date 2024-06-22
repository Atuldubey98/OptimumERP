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
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import React, { useState } from "react";
import TourGuide from "./TourGuide";
import dashboard from "../../assets/dashboard.png";
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
        <ModalBody pb={6}>
          <Tabs index={currentIndex} orientation="vertical">
            <TabList w={200} onChange={(index) => setCurrentIndex(index)}>
              {tabs.map((tab, index) => (
                <Tab onClick={() => setCurrentIndex(index)} key={tab.label}>
                  {tab.label}
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {tabs.map((tab) => (
                <TabPanel key={tab.label}>
                  <TourGuide
                    description={tab.description}
                    imgSrc={dashboard}
                    label={tab.label}
                  />
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </ModalBody>
        <Divider />
        <ModalFooter>
          <ButtonGroup>
            {currentIndex === 0 ? null : (
              <Button onClick={onPreviousTab} mr={3}>
                Previous
              </Button>
            )}
            {tabs.length - 1 === currentIndex ? null : (
              <Button onClick={onNextTab}>Next</Button>
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
