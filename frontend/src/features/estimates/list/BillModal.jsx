import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Tooltip,
  Checkbox,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IoCheckmark } from "react-icons/io5";
import { CiSaveDown2 } from "react-icons/ci";
import instance, { baseURL } from "../../../instance";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
export default function BillModal({ onClose, isOpen, bill, entity, heading }) {
  const { i18n } = useTranslation();
  const [status, setStatus] = useState("idle");
  const [billLoadStatus, setBillLoadStatus] = useState("loading");
  const templateColors = [
    { name: "Transparent", hex: "" },
    { name: "Indigo", hex: "3f51b5" },
    { name: "Dark Green", hex: "388e3c" },
    { name: "Deep Purple", hex: "7b1fa2" },
    { name: "Dark Red", hex: "d32f2f" },
    { name: "Dark Gray", hex: "616161" },
  ];
  const [color, setColor] = useState(templateColors[0].hex);
  const [signature, setSignature] = useState(false);
  const settingContext = useCurrentOrgCurrency();
  const setting = settingContext?.setting;
  const templateName = setting?.printSettings?.defaultTemplate || "simple";
  const language = i18n.resolvedLanguage || i18n.language || "en";
  const downloadBill = `/api/v1/organizations/${bill.org._id}/${entity}/${bill._id}/download`;
  const onSaveBill = async () => {
    setStatus("downloading");
    const { data } = await instance.get(downloadBill, {
      responseType: "blob",
      params: {
        template: templateName,
        color,
        lng: language,
        signature,
      },
    });
    const href = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.setAttribute("download", `${entity}-${bill.num}.pdf`);
    link.href = href;
    link.click();
    URL.revokeObjectURL(href);
    setStatus("idle");
  };
  const isDownloading = status === "downloading";
  const isLoading = billLoadStatus === "loading";

  return (
    <Modal
      size={"5xl"}
      onClose={() => {
        onClose();
        setBillLoadStatus("loading");
      }}
      isOpen={isOpen}
      scrollBehavior={"inside"}
    >
      <ModalOverlay />
      <ModalContent mx={{ base: 2, md: "auto" }}>
        <ModalHeader>{heading}</ModalHeader>
        <ModalCloseButton />
        <ModalBody h={"100svh"}>
          <Skeleton isLoaded={!isLoading}>
            <iframe
              onLoad={() => {
                setBillLoadStatus("idle");
              }}
              width={"100%"}
              height={"550px"}
              src={
                baseURL +
                downloadBill +
                `?template=${templateName}&color=${color}&lng=${language}&signature=${signature}`
              }
            />
          </Skeleton>
        </ModalBody>
        <ModalFooter
          flexWrap="wrap"
          gap={3}
          justifyContent="flex-end"
        >
          <Flex
            alignItems={"center"}
            gap={2}
            mr="auto"
            flexWrap="wrap"
            pointerEvents={isLoading ? "none" : "auto"}
            opacity={isLoading ? 0.4 : 1}
          >
            {templateColors.map((templateColor) => (
              <Tooltip key={templateColor.hex} label={templateColor.name}>
                <Flex
                  justifyContent={"center"}
                  alignItems={"center"}
                  onClick={() => {
                    if (isLoading) return;
                    setBillLoadStatus("loading");
                    setColor(templateColor.hex);
                  }}
                  cursor={isLoading ? "not-allowed" : "pointer"}
                  bg={templateColor.hex ? `#${templateColor.hex}` : "transparent"}
                  border={templateColor.hex ? "none" : "1px solid"}
                  borderColor="gray.300"
                  w={{ base: "30px", md: "36px" }}
                  h={{ base: "30px", md: "36px" }}
                  borderRadius={"full"}
                  flexShrink={0}
                >
                  {color === templateColor.hex && (
                    <IoCheckmark
                      size={16}
                      color={templateColor.hex ? "white" : "black"}
                    />
                  )}
                </Flex>
              </Tooltip>
            ))}
          </Flex>

          <Checkbox
            colorScheme="blue"
            isChecked={signature}
            isDisabled={isLoading}
            onChange={(e) => {
              setBillLoadStatus("loading");
              setSignature(e.target.checked);
            }}
            whiteSpace="nowrap"
          >
            Apply Signature
          </Checkbox>

          <ButtonGroup size={{ base: "sm", md: "md" }}>
            <Button onClick={onClose}>Close</Button>
            <Button
              leftIcon={<CiSaveDown2 />}
              isLoading={isDownloading}
              onClick={onSaveBill}
              colorScheme="green"
            >
              Download
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
