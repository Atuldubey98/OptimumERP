import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Hide,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { CiSaveDown2 } from "react-icons/ci";
import instance, { baseURL } from "../../../instance";
import { useState } from "react";
import { IoPrintOutline } from "react-icons/io5";
import useAsyncCall from "../../../hooks/useAsyncCall";
export default function BillModal({ onClose, isOpen, bill, entity, heading }) {
  const { requestAsyncHandler } = useAsyncCall();
  const [status, setStatus] = useState("idle");
  const [billLoadStatus, setBillLoadStatus] = useState("loading");
  const [templateName, setTemplateName] = useState("simple");
  const onSaveBill = async () => {
    const downloadBill = `/api/v1/organizations/${bill.org._id}/${entity}/${bill._id}/download?template=${templateName}`;
    const { data } = await instance.get(downloadBill, {
      responseType: "blob",
    });
    const href = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.setAttribute("download", `${heading}-${bill.date}.pdf`);
    link.href = href;
    link.click();
    URL.revokeObjectURL(href);
  };
  const viewBill = `/api/v1/organizations/${bill.org._id}/${entity}/${bill._id}/view?template=${templateName}`;
  const onPrintBill = requestAsyncHandler(async () => {
    setStatus("loading");
    const { data } = await instance.get(viewBill);
    setStatus("success");
    const billPrint = window.open("", "");
    billPrint.document.write(data);
    billPrint.document.close();
    billPrint.onload = function () {
      billPrint.focus();
      billPrint.print();
      billPrint.close();
    };
  });
  const isBillLoading = billLoadStatus === "idle";
  const templates = [
    { value: "simple", label: "Simple", templateImg: "/templates/simple.png" },
    { value: "modern", label: "Modern", templateImg: "/templates/modern.png" },
    {
      value: "border-land",
      label: "Border-land",
      templateImg: "/templates/border-land.png",
    },
  ];
  const hoverBg = useColorModeValue("gray.200", "gray.600");

  return (
    <Modal
      size={"full"}
      onClose={onClose}
      isOpen={isOpen}
      scrollBehavior={"inside"}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{heading}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Skeleton isLoaded={isBillLoading}>
            <iframe
              onLoad={() => {
                setBillLoadStatus("idle");
              }}
              style={{
                padding: 2,
                borderRadius: 10,
                border: "none",
              }}
              width={"100%"}
              height={600}
              src={`${baseURL}${viewBill}`}
            />
          </Skeleton>
          <Flex marginBlock={2} gap={3}>
            {templates.map((template) => (
              <Flex
                p={1}
                justifyContent={"center"}
                alignItems={"center"}
                flexDir={"column"}
                cursor={"pointer"}
                width={60}
                bg={template.value === templateName ? hoverBg : undefined}
                key={template.value}
                onClick={() => {
                  setTemplateName(template.value);
                  localStorage.setItem("template", template.value);
                }}
              >
                <Image
                  width={20}
                  objectFit={"contain"}
                  src={template.templateImg}
                />
                <Text fontSize={"sm"} textAlign={"center"}>
                  {template.label}
                </Text>
              </Flex>
            ))}
          </Flex>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button onClick={onClose}>Close</Button>
            <Hide below="md">
              <Button
                leftIcon={<IoPrintOutline />}
                onClick={onPrintBill}
                colorScheme="blue"
                isLoading={status === "loading"}
              >
                Print
              </Button>
            </Hide>
            <Button
              leftIcon={<CiSaveDown2 />}
              onClick={() => {
                onSaveBill(bill);
              }}
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
