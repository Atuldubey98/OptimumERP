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
import { useTranslation } from "react-i18next";
import { LiaCaretLeftSolid, LiaCaretRightSolid } from "react-icons/lia";
import dashboard from "../../assets/dashboard.png";
import TourGuide from "./TourGuide";
export default function GuideTourModal({ isOpen, onClose }) {
  const { t } = useTranslation("dashboard");
  const [currentIndex, setCurrentIndex] = useState(0);
  const onNextTab = () => setCurrentIndex((prev) => ++prev);
  const onPreviousTab = () => setCurrentIndex((prev) => --prev);

  const tabs = [
    {
      label: t("dashboard_ui.tour.tabs.dashboard.label"),
      description: t("dashboard_ui.tour.tabs.dashboard.description"),
    },
    {
      label: t("dashboard_ui.tour.tabs.stats.label"),
      description: t("dashboard_ui.tour.tabs.stats.description"),
    },
    {
      label: t("dashboard_ui.tour.tabs.parties.label"),
      description: t("dashboard_ui.tour.tabs.parties.description"),
    },
    {
      label: t("dashboard_ui.tour.tabs.contacts.label"),
      description: t("dashboard_ui.tour.tabs.contacts.description"),
    },
    {
      label: t("dashboard_ui.tour.tabs.invoices.label"),
      description: t("dashboard_ui.tour.tabs.invoices.description"),
    },
    {
      label: t("dashboard_ui.tour.tabs.proforma_invoices.label"),
      description: t("dashboard_ui.tour.tabs.proforma_invoices.description"),
    },
    {
      label: t("dashboard_ui.tour.tabs.purchase_orders.label"),
      description: t("dashboard_ui.tour.tabs.purchase_orders.description"),
    },
    {
      label: t("dashboard_ui.tour.tabs.quotations.label"),
      description: t("dashboard_ui.tour.tabs.quotations.description"),
    },
    {
      label: t("dashboard_ui.tour.tabs.purchases.label"),
      description: t("dashboard_ui.tour.tabs.purchases.description"),
    },
    {
      label: t("dashboard_ui.tour.tabs.expenses.label"),
      description: t("dashboard_ui.tour.tabs.expenses.description"),
    },
    {
      label: t("dashboard_ui.tour.tabs.items.label"),
      description: t("dashboard_ui.tour.tabs.items.description"),
    },
    {
      label: t("dashboard_ui.tour.tabs.reports.label"),
      description: t("dashboard_ui.tour.tabs.reports.description"),
    },
    {
      label: t("dashboard_ui.tour.tabs.admin.label"),
      description: t("dashboard_ui.tour.tabs.admin.description"),
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
        <ModalHeader>{t("dashboard_ui.tour.welcome_title")}</ModalHeader>
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
                {t("dashboard_ui.actions.previous")}
              </Button>
            )}
            {tabs.length - 1 === currentIndex ? null : (
              <Button rightIcon={<LiaCaretRightSolid />} onClick={onNextTab}>
                {t("dashboard_ui.actions.next")}
              </Button>
            )}
            {tabs.length - 1 === currentIndex ? (
              <Button onClick={onClose} colorScheme="blue">
                {t("dashboard_ui.actions.finish")}
              </Button>
            ) : null}
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
