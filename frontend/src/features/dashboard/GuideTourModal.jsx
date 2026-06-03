import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Flex,
  Circle,
} from "@chakra-ui/react";
import { LiaCaretLeftSolid, LiaCaretRightSolid } from "react-icons/lia";
import {
  FaCompass,
  FaRobot,
  FaFileInvoiceDollar,
  FaShoppingCart,
  FaSyncAlt,
  FaBoxes,
  FaChartBar,
  FaCog,
} from "react-icons/fa";
import TourGuide from "./TourGuide";

export default function GuideTourModal({ isOpen, onClose }) {
  const { t } = useTranslation("dashboard");
  const [currentIndex, setCurrentIndex] = useState(0);

  const tabs = [
    {
      key: "welcome",
      icon: FaCompass,
    },
    {
      key: "ai_assistant",
      icon: FaRobot,
    },
    {
      key: "billing",
      icon: FaFileInvoiceDollar,
    },
    {
      key: "procurement",
      icon: FaShoppingCart,
    },
    {
      key: "automation",
      icon: FaSyncAlt,
    },
    {
      key: "inventory",
      icon: FaBoxes,
    },
    {
      key: "reports",
      icon: FaChartBar,
    },
    {
      key: "admin",
      icon: FaCog,
    },
  ];

  const tourTabs = tabs.map((tab) => ({
    ...tab,
    label: t(`dashboard_ui.tour.tabs.${tab.key}.label`),
    description: t(`dashboard_ui.tour.tabs.${tab.key}.description`),
    features: Array.isArray(t(`dashboard_ui.tour.tabs.${tab.key}.features`, { returnObjects: true }))
      ? t(`dashboard_ui.tour.tabs.${tab.key}.features`, { returnObjects: true })
      : [],
  }));

  const guide = tourTabs[currentIndex];

  const onNextTab = () => setCurrentIndex((prev) => Math.min(prev + 1, tourTabs.length - 1));
  const onPreviousTab = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  return (
    <Modal
      size={"3xl"}
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
      <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="2xl" _dark={{ bg: "gray.800" }}>
        <ModalHeader borderBottomWidth="1px" borderColor="gray.100" _dark={{ borderColor: "gray.700" }} py={4} fontSize="lg" fontWeight="bold">
          {t("dashboard_ui.tour.welcome_title")}
        </ModalHeader>
        <ModalCloseButton top="14px" />
        <ModalBody py={6}>
          <TourGuide
            icon={guide.icon}
            label={guide.label}
            description={guide.description}
            features={guide.features}
            currentIndex={currentIndex}
            totalSteps={tourTabs.length}
          />
        </ModalBody>
        <Divider borderColor="gray.100" _dark={{ borderColor: "gray.700" }} />
        <ModalFooter bg="gray.50" _dark={{ bg: "gray.900" }} py={4}>
          <Flex justify="space-between" align="center" w="100%">
            {/* Left: Skip button */}
            <Button 
              variant="ghost" 
              onClick={onClose} 
              size="sm" 
              fontWeight="medium" 
              color="gray.500" 
              _dark={{ color: "gray.400" }}
              _hover={{ color: "gray.700", _dark: { color: "gray.200" } }}
            >
              {t("dashboard_ui.actions.skip")}
            </Button>

            {/* Center: Progress indicators */}
            <Flex gap={2.5} align="center">
              {tourTabs.map((_, index) => (
                <Circle
                  key={index}
                  size="9px"
                  bg={index === currentIndex ? "blue.500" : "gray.300"}
                  _dark={{ bg: index === currentIndex ? "blue.400" : "gray.600" }}
                  cursor="pointer"
                  onClick={() => setCurrentIndex(index)}
                  transition="all 0.3s ease"
                  transform={index === currentIndex ? "scale(1.2)" : "scale(1)"}
                  _hover={{ bg: index === currentIndex ? "blue.600" : "gray.400", _dark: { bg: index === currentIndex ? "blue.300" : "gray.500" } }}
                />
              ))}
            </Flex>

            {/* Right: Next/Prev/Finish buttons */}
            <Flex gap={2}>
              {currentIndex > 0 && (
                <Button
                  leftIcon={<LiaCaretLeftSolid />}
                  onClick={onPreviousTab}
                  variant="outline"
                  size="sm"
                >
                  {t("dashboard_ui.actions.previous")}
                </Button>
              )}
              {currentIndex < tourTabs.length - 1 ? (
                <Button
                  rightIcon={<LiaCaretRightSolid />}
                  onClick={onNextTab}
                  colorScheme="blue"
                  size="sm"
                >
                  {t("dashboard_ui.actions.next")}
                </Button>
              ) : (
                <Button
                  onClick={onClose}
                  colorScheme="teal"
                  size="sm"
                  fontWeight="bold"
                >
                  {t("dashboard_ui.actions.finish")}
                </Button>
              )}
            </Flex>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
