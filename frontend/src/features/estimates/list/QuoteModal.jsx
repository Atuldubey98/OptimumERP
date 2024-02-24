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
} from "@chakra-ui/react";
import instance from "../../../instance";
import { useState } from "react";
import useAsyncCall from "../../../hooks/useAsyncCall";
export default function QuoteModal({ onClose, isOpen, quotation }) {
  const { requestAsyncHandler } = useAsyncCall();
  const [status, setStatus] = useState("idle");
  const onSaveQuote = requestAsyncHandler(async () => {
    setStatus("loading");
    const { data } = await instance.get(
      `/api/v1/organizations/${quotation.org._id}/quotes/${quotation._id}/download`
    );
    setStatus("success");
    const quotePrint = window.open("", "");
    quotePrint.document.write(data);
    quotePrint.document.close();
    quotePrint.onload = function () {
      quotePrint.focus();
      quotePrint.print();
      quotePrint.close();
    };
  });
  return (
    <Modal
      size={"full"}
      onClose={onClose}
      isOpen={isOpen}
      scrollBehavior={"inside"}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Quotation</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <iframe
            width={"100%"}
            height={720}
            src={`http://localhost:9000/api/v1/organizations/${quotation.org._id}/quotes/${quotation._id}/download`}
            frameBorder="0"
          />
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button onClick={onClose}>Close</Button>
            <Button
              onClick={onSaveQuote}
              colorScheme="blue"
              isLoading={status === "loading"}
            >
              Save as PDF
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
