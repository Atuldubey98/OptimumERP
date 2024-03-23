import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import QRCode from "react-qr-code";
export default function BankAccountUpiQRCodeModal({
  upi,
  onClose,
  isOpen,
  accountHolderName,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Bank account Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex justifyContent={"center"} alignItems={"center"}>
            <QRCode
              value={`upi://pay?pa=${upi}&amp;pn=${accountHolderName}&amp;cu=INR`}
            />
          </Flex>
          <Box borderRadius={"md"} border={"1px solid lightgray"} marginTop={2} p={3}>
            <Text textAlign={"center"}>Scan the QR Code for UPI Id below</Text>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
