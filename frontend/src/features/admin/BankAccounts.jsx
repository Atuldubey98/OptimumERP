import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
} from "@chakra-ui/react";
import React from "react";
import HelpPopover from "../common/HelpPopover";

export default function BankAccounts({ bankFormik }) {
  return (
    <form onSubmit={bankFormik.handleSubmit}>
      <Stack spacing={4}>
        <Flex justifyContent={"space-between"} alignItems={"center"}>
          <Heading fontSize={"lg"}>Bank details</Heading>
          <HelpPopover
            title={"Bank Details"}
            description={"Fill your bank details here"}
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
            size={"sm"}
            type="submit"
            isLoading={bankFormik.isSubmitting}
            colorScheme="blue"
          >
            Update
          </Button>
        </Flex>
      </Stack>
    </form>
  );
}
