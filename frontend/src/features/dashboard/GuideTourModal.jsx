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
      children: (
        <TourGuide
          imgSrc={dashboard}
          label={"Dashboard"}
          description={
            "Get a quick overview of your business operations and key metrics in one centralized dashboard."
          }
        />
      ),
    },
    {
      label: "Parties",
      children: (
        <TourGuide
          imgSrc={dashboard}
          label={"Parties"}
          description={
            "Manage all your business contacts, customers, and suppliers efficiently in one place."
          }
        />
      ),
    },
    {
      label: "Stats",
      children: (
        <TourGuide
          imgSrc={dashboard}
          label={"Stats"}
          description={
            "Access detailed statistics and analytics to gain insights into your business performance and make informed decisions."
          }
        />
      ),
    },
    {
      label: "Contacts",
      children: (
        <TourGuide
          imgSrc={dashboard}
          label={"Contacts"}
          description={
            "Organize and maintain a comprehensive database of all your business contacts, ensuring smooth communication and relationship management."
          }
        />
      ),
    },
    {
      label: "Invoices",
      children: (
        <TourGuide
          imgSrc={dashboard}
          label={"Invoices"}
          description={
            "Create, track, and manage invoices seamlessly, streamlining your billing processes and improving cash flow management."
          }
        />
      ),
    },
    {
      label: "Expenses",
      children: (
        <TourGuide
          imgSrc={dashboard}
          label={"Expenses"}
          description={
            "Track and manage all business expenses effectively, ensuring accurate financial reporting and budget control."
          }
        />
      ),
    },
    {
      label: "Items",
      children: (
        <TourGuide
          imgSrc={dashboard}
          label={"Items & Categories"}
          description={
            "Organize and categorize your inventory items efficiently, making it easy to manage and track stock levels."
          }
        />
      ),
    },
    {
      label: "Purchases",
      children: (
        <TourGuide
          imgSrc={dashboard}
          label={"Purchases"}
          description={
            "Simplify your procurement process with our purchase management feature. Create purchase orders, track deliveries, and manage vendor relationships efficiently."
          }
        />
      ),
    },
    {
      label: "Reports",
      children: (
        <TourGuide
          imgSrc={dashboard}
          label={"Reports"}
          description={
            "Generate comprehensive reports and analytics to gain insights into various aspects of your business, facilitating data-driven decision-making."
          }
        />
      ),
    },
    {
      label: "Admin",
      children: (
        <TourGuide
          imgSrc={dashboard}
          label={"Admin"}
          description={
            "Access advanced settings and configurations through the admin panel. Customize user permissions, set up integrations, and manage system preferences effortlessly"
          }
        />
      ),
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
            <TabList onChange={(index) => setCurrentIndex(index)}>
              {tabs.map((tab, index) => (
                <Tab onClick={() => setCurrentIndex(index)} key={tab.label}>
                  {tab.label}
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {tabs.map((tab) => (
                <TabPanel key={tab.label}>{tab.children}</TabPanel>
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
