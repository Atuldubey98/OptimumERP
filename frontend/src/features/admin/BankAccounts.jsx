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
import { useTranslation } from "react-i18next";
import HelpPopover from "../common/HelpPopover";

export default function BankAccounts({ bankFormik }) {
  const bg = useColorModeValue("gray.100", "gray.700");
  const { t } = useTranslation("admin");

  return (
    <form onSubmit={bankFormik.handleSubmit}>
      <Stack>
        <Box bg={bg} p={3}>
          <Heading fontSize={"lg"}>{t("bank.heading")}</Heading>
        </Box>
        <Box>
          <Flex justifyContent="space-between" alignItems={"center"}>
            <HelpPopover
              title={t("bank.help_title")}
              description={t("bank.help_description")}
            />
            <Button
              size={"sm"}
              type="submit"
              isLoading={bankFormik.isSubmitting}
              colorScheme="blue"
            >
              {t("actions.save")}
            </Button>
          </Flex>
          <SimpleGrid gap={3} minChildWidth={300}>
            <FormControl
              isRequired
              isInvalid={bankFormik.errors.accountHolderName}
            >
              <FormLabel>{t("bank.account_holder_name")}</FormLabel>
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
              <FormLabel>{t("bank.bank_name")}</FormLabel>
              <Input
                name="name"
                onChange={bankFormik.handleChange}
                value={bankFormik.values.name}
              />
              <FormErrorMessage>{bankFormik.errors.name}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={bankFormik.errors.ifscCode}>
              <FormLabel>{t("bank.ifsc_code")}</FormLabel>
              <Input
                name="ifscCode"
                onChange={bankFormik.handleChange}
                value={bankFormik.values.ifscCode}
              />
              <FormErrorMessage>{bankFormik.errors.ifscCode}</FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={bankFormik.errors.accountNo}>
              <FormLabel>{t("bank.account_no")}</FormLabel>
              <Input
                type="number"
                name="accountNo"
                onChange={bankFormik.handleChange}
                value={bankFormik.values.accountNo}
              />
              <FormErrorMessage>{bankFormik.errors.accountNo}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={bankFormik.errors.upi}>
              <FormLabel>{t("bank.upi")}</FormLabel>
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
