import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import { MdOutlineQrCode } from "react-icons/md";
import BankAccountUpiQRCodeModal from "./BankAccountUpiQRCodeModal";

export default function BankAccounts({ bankFormik }) {
  const {
    isOpen: isOpenBankAccountModal,
    onOpen: openBankAccountModal,
    onClose: closeBankAccountModal,
  } = useDisclosure();
  return (
    <form onSubmit={bankFormik.handleSubmit}>
      <Stack
        marginBlock={3}
        boxShadow={"md"}
        borderRadius={"md"}
        p={4}
        spacing={4}
        maxW={"xl"}
      >
        <Flex justifyContent={"flex-end"} alignItems={"center"} marginBlock={1}>
          <IconButton
            onClick={openBankAccountModal}
            icon={<MdOutlineQrCode />}
            isDisabled={!bankFormik.values.upi}
          />
        </Flex>
        <FormControl isInvalid={bankFormik.errors.accountHolderName}>
          <FormLabel>Account Holder Name</FormLabel>
          <Input
            name="accountHolderName"
            onChange={bankFormik.handleChange}
            value={bankFormik.values.accountHolderName}
          />
          <FormErrorMessage>
            {bankFormik.errors.accountHolderName}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={bankFormik.errors.name}>
          <FormLabel>Bank Name</FormLabel>
          <Input
            name="name"
            onChange={bankFormik.handleChange}
            value={bankFormik.values.name}
          />
          <FormErrorMessage>{bankFormik.errors.name}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={bankFormik.errors.ifscCode}>
          <FormLabel>IFSC Code</FormLabel>
          <Input
            name="ifscCode"
            onChange={bankFormik.handleChange}
            value={bankFormik.values.ifscCode}
          />
          <FormErrorMessage>{bankFormik.errors.ifscCode}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={bankFormik.errors.accountNo}>
          <FormLabel>Bank Account no</FormLabel>
          <Input
            type="number"
            name="accountNo"
            onChange={bankFormik.handleChange}
            value={bankFormik.values.accountNo}
          />
          <FormErrorMessage>{bankFormik.errors.accountNo}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={bankFormik.errors.upi}>
          <FormLabel>UPI</FormLabel>
          <Input
            name="upi"
            onChange={bankFormik.handleChange}
            value={bankFormik.values.upi}
          />
          <FormErrorMessage>{bankFormik.errors.accountNo}</FormErrorMessage>
        </FormControl>
        <Flex justifyContent="center" alignItems={"center"}>
          <Button
            type="submit"
            isLoading={bankFormik.isSubmitting}
            colorScheme="blue"
          >
            Update
          </Button>
        </Flex>
      </Stack>
      {bankFormik.values.upi && isOpenBankAccountModal ? (
        <BankAccountUpiQRCodeModal
          accountHolderName={bankFormik.values.accountHolderName}
          upi={bankFormik.values.upi}
          isOpen={isOpenBankAccountModal}
          onClose={closeBankAccountModal}
        />
      ) : null}
    </form>
  );
}
