import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Tooltip,
} from "@chakra-ui/react";
import { useState } from "react";
import { IoCheckmark } from "react-icons/io5";
import { CiSaveDown2 } from "react-icons/ci";
import instance, { baseURL } from "../../../instance";
export default function BillModal({ onClose, isOpen, bill, entity, heading }) {
  const [status, setStatus] = useState("idle");
  const [billLoadStatus, setBillLoadStatus] = useState("loading");
  const templateColors = [
    { name: "Dark Purple", hex: "3f51b5" },
    { name: "Dark Green", hex: "388e3c" },
    { name: "Dark Purple", hex: "7b1fa2" },
    { name: "Dark Red", hex: "d32f2f" },
    { name: "Dark Gray", hex: "616161" },
  ];
  const [color, setColor] = useState(templateColors[0].hex);
  const [templateName, setTemplateName] = useState("simple");
  const downloadBill = `/api/v1/organizations/${bill.org._id}/${entity}/${bill._id}/download`;
  const onSaveBill = async () => {
    setStatus("downloading");
    const { data } = await instance.get(downloadBill, {
      responseType: "blob",
      params: {
        template: templateName,
        color,
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
      <ModalContent>
        <ModalHeader>{heading}</ModalHeader>
        <ModalCloseButton />
        <ModalBody h={"100svh"}>
          <Skeleton isLoaded={billLoadStatus === "idle"}>
            <iframe
              onLoad={() => {
                setBillLoadStatus("idle");
              }}
              width={"100%"}
              height={"550px"}
              src={
                baseURL +
                downloadBill +
                `?template=${templateName}&color=${color}`
              }
            />
          </Skeleton>
        </ModalBody>
        <ModalFooter>
          <Flex mr={6} justifyContent={"center"} alignItems={"center"} gap={2}>
            {templateColors.map((templateColor) => (
              <Box key={templateColor.hex}>
                <Tooltip label={templateColor.name}>
                  <Flex
                    justifyContent={"center"}
                    alignItems={"center"}
                    key={templateColor.hex}
                    onClick={() => {
                      setBillLoadStatus("loading");
                      setColor(templateColor.hex);
                    }}
                    cursor={"pointer"}
                    bg={`#${templateColor.hex}`}
                    width={"40px"}
                    height={"40px"}
                    borderRadius={"50%"}
                  >
                    {color === templateColor.hex && (
                      <IoCheckmark size={20} color="white" />
                    )}
                  </Flex>
                </Tooltip>
              </Box>
            ))}
          </Flex>
          <Divider orientation="vertical" />
          <ButtonGroup>
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
