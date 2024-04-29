import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Skeleton,
  Stack,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useEffect } from "react";
import currencies from "../../../assets/currency.json";
import instance from "../../../instance";
import { IoIosHelpCircleOutline } from "react-icons/io";
import localeCodes from "../../../constants/localeCodes";
function TransactionPopoverInstructions() {
  return (
    <Popover>
      <PopoverTrigger>
        <IconButton size={"sm"} icon={<IoIosHelpCircleOutline />} />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Transaction Settings</PopoverHeader>
        <PopoverBody>
          Define your currency, invoice prefixes, quotation prefixes and fiscal
          year here.
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
export default function TransactionPrefix({ formik, loading, printFormik }) {
  useEffect(() => {
    (async () => {
      if (!formik.values.organization) {
        formik.setValues({
          organization: "",
          invoice: "",
          currency: "INR",
          quotation: "",
          localeCode: "en-IN",
          proformaInvoice: "",
          startDate: "",
          endDate: "",
        });
        printFormik.setValues({ bank: false, upiQr: false });
        return;
      }
      const { data } = await instance.get(
        `/api/v1/organizations/${formik.values.organization}/settings`
      );
      formik.setValues({
        organization: formik.values.organization,
        invoice: data.data.transactionPrefix.invoice,
        quotation: data.data.transactionPrefix.quotation,
        localeCode: data.data.localeCode || "en-IN",
        proformaInvoice: data.data.transactionPrefix.proformaInvoice || "",
        currency: data.data.currency || "INR",
        endDate: new Date(data.data.financialYear.end)
          .toISOString()
          .split("T")[0],
        startDate: new Date(data.data.financialYear.start)
          .toISOString()
          .split("T")[0],
      });
      printFormik.setValues(data.data.printSettings);
    })();
  }, [formik.values.organization]);
  const currencyCodes = Object.keys(currencies);

  const currencyOptions = currencyCodes.map((currency) => ({
    label: `${currency} - ${currencies[currency].symbol}`,
    value: currency,
  }));
  const localeCodeOptions = localeCodes.map((localeCode) => ({
    label: `${localeCode.country} [${localeCode.locale}]`,
    value: localeCode.locale,
  }));
  return (
    <Stack spacing={6}>
      <Flex justifyContent={"space-between"} alignItems={"center"}>
        <Heading fontSize={"lg"}>Transaction</Heading>
        <TransactionPopoverInstructions />
      </Flex>
      <Skeleton isLoaded={!loading}>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
            <Flex gap={2}>
              <FormControl isDisabled={!formik.values.organization}>
                <FormLabel>Currency</FormLabel>
                <Select
                  name="currency"
                  value={currencyOptions.find(
                    (currencyOption) =>
                      currencyOption.value === formik.values.currency
                  )}
                  options={currencyOptions}
                  onChange={({ value }) => {
                    formik.setFieldValue("currency", value);
                  }}
                />
              </FormControl>
              <FormControl isDisabled={!formik.values.organization}>
                <FormLabel>Locale Code</FormLabel>
                <Select
                  name="localeCode"
                  value={localeCodeOptions.find(
                    (localeCode) =>
                      localeCode.value === formik.values.localeCode
                  )}
                  onChange={({ value }) => {
                    formik.setFieldValue("localeCode", value);
                  }}
                  options={localeCodeOptions}
                />
              </FormControl>
            </Flex>
            <FormControl isDisabled={!formik.values.organization}>
              <FormLabel>Invoice Prefix</FormLabel>
              <Input
                name="invoice"
                value={formik.values.invoice}
                onChange={formik.handleChange}
                placeholder="ABC-ORG/23-24/XXXX"
              />
            </FormControl>
            <FormControl isDisabled={!formik.values.organization}>
              <FormLabel>Quotation Prefix</FormLabel>
              <Input
                name="quotation"
                value={formik.values.quotation}
                onChange={formik.handleChange}
                placeholder="ABC-ORG/23-24/XXXX"
              />
            </FormControl>
            <FormControl isDisabled={!formik.values.organization}>
              <FormLabel>Proforma Invoice Prefix</FormLabel>
              <Input
                name="proformaInvoice"
                value={formik.values.proformaInvoice}
                onChange={formik.handleChange}
                placeholder="ABC-ORG/23-24/XXXX"
              />
            </FormControl>
            <Box>
              <FormControl>Fiscal Year</FormControl>
              <Flex gap={3}>
                <FormControl
                  isDisabled={!formik.values.organization}
                  isRequired
                >
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    name="startDate"
                    value={formik.values.startDate}
                    onChange={formik.handleChange}
                    placeholder="dd-mm-yyyy"
                    type="date"
                  />
                </FormControl>
                <FormControl
                  isDisabled={!formik.values.organization}
                  isRequired
                >
                  <FormLabel>End Date</FormLabel>
                  <Input
                    value={formik.values.endDate}
                    placeholder="dd-mm-yyyy"
                    type="date"
                    name="endDate"
                    onChange={formik.handleChange}
                  />
                </FormControl>
              </Flex>
            </Box>
          </Stack>
          <Flex mt={3} justifyContent={"center"} alignItems={"center"}>
            <Button
              size={"sm"}
              isLoading={formik.isSubmitting || loading}
              isDisabled={!formik.values.organization}
              type="submit"
              colorScheme="blue"
            >
              Update
            </Button>
          </Flex>
        </form>
      </Skeleton>
    </Stack>
  );
}
