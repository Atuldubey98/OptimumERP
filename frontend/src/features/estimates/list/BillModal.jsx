import {
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
} from "@chakra-ui/react";
import { CiSaveDown2 } from "react-icons/ci";
import instance, { baseURL } from "../../../instance";
import { useState } from "react";
import { IoPrintOutline } from "react-icons/io5";
import useAsyncCall from "../../../hooks/useAsyncCall";
export default function BillModal({
  onClose,
  isOpen,
  bill,
  entity,
  heading,
  onSaveBill,
  templateName = "simple",
}) {
  const { requestAsyncHandler } = useAsyncCall();
  const [status, setStatus] = useState("idle");
  const [billLoadStatus, setBillLoadStatus] = useState("loading");
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
              height={720}
              src={`${baseURL}${viewBill}`}
            />
          </Skeleton>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button onClick={onClose}>Close</Button>
            <Button
              leftIcon={<IoPrintOutline />}
              onClick={onPrintBill}
              colorScheme="blue"
              isLoading={status === "loading"}
            >
              Print
            </Button>
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
