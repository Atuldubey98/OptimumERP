import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";

export default function BankAccounts({ bankFormik }) {
  const bg = useColorModeValue("gray.100", "gray.700");

  return (
    <form onSubmit={bankFormik.handleSubmit}>
      <Stack>
        <Box bg={bg} p={3}>
          <Heading fontSize={"lg"}>Bank</Heading>
        </Box>
        <Box p={4}>
          <Flex justifyContent="flex-end" alignItems={"center"}>
            <Button
              size={"sm"}
              type="submit"
              isLoading={bankFormik.isSubmitting}
              colorScheme="blue"
            >
              Save
            </Button>
          </Flex>
          <SimpleGrid gap={3} minChildWidth={300}>
            <FormControl
              isRequired
              isInvalid={bankFormik.errors.accountHolderName}
            >
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
            <FormControl isRequired isInvalid={bankFormik.errors.name}>
              <FormLabel>Bank Name</FormLabel>
              <Input
                name="name"
                onChange={bankFormik.handleChange}
                value={bankFormik.values.name}
              />
              <FormErrorMessage>{bankFormik.errors.name}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={bankFormik.errors.ifscCode}>
              <FormLabel>IFSC Code</FormLabel>
              <Input
                name="ifscCode"
                onChange={bankFormik.handleChange}
                value={bankFormik.values.ifscCode}
              />
              <FormErrorMessage>{bankFormik.errors.ifscCode}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={bankFormik.errors.accountNo}>
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
          </SimpleGrid>
        </Box>
      </Stack>
    </form>
  );
}
