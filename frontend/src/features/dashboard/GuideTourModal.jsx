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
            " Get an overview of your business's performance at a glance. Track key metrics, such as sales, expenses, and profit margins, through intuitive charts and graphs."
          }
        />
      ),
    },
    {
      label: "Customers",
      children: (
        <TourGuide
          imgSrc={dashboard}
          label={"Customers"}
          description={
            "Manage your customer relationships efficiently. Add new customers, view their details, and track interactions to provide excellent service"
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
            "Streamline your billing process with our easy-to-use invoicing system. Create, send, and track invoices effortlessly, ensuring timely payments and improving cash flow."
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
            "Keep track of your expenses seamlessly. Record expenses incurred for various purposes, categorize them accurately, and monitor spending to stay within budget."
          }
        />
      ),
    },
    {
      label: "Products",
      children: (
        <TourGuide
          imgSrc={dashboard}
          label={"Products"}
          description={
            " Manage your product inventory with ease. Add new products, update existing ones, and track stock levels to ensure smooth operations."
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
      size={"2xl"}
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
