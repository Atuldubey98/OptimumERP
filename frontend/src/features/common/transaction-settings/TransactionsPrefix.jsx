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
  useDisclosure,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useEffect, useState } from "react";
import currencies from "../../../assets/currency.json";
import instance from "../../../instance";
import { IoIosHelpCircleOutline } from "react-icons/io";
import PrefixForm from "./PrefixForm";
import { IoAdd } from "react-icons/io5";
import moment from 'moment';
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
          purchaseOrder: "",
          invoice: "",
          currency: "INR",
          quotation: "",
          proformaInvoice: "",
          localeCode: "en-IN",
          startDate: "",
          endDate: "",
          prefixes: {
            invoice: [""],
            quotation: [""],
            purchaseOrder: [""],
            proformaInvoice: [""],
          },
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
        purchaseOrder: data.data.transactionPrefix.purchaseOrder || "",
        localeCode: data.data.localeCode || "en-IN",
        proformaInvoice: data.data.transactionPrefix.proformaInvoice || "",
        currency: data.data.currency || "INR",
        endDate: moment(data.data.financialYear.end).format('YYYY-MM-DD'),
        startDate: moment(data.data.financialYear.start).format('YYYY-MM-DD'),
        prefixes: data.data.prefixes,
      });
      printFormik.setValues(data.data.printSettings);
    })();
  }, [formik.values.organization]);
  const currencyCodes = Object.keys(currencies);

  const currencyOptions = currencyCodes.map((currency) => ({
    label: `${currencies[currency].name} (${currency})-${currencies[currency].symbol}`,
    value: currency,
  }));
  const getPrefixOptions = (prefixType) =>
    formik.values.prefixes[prefixType].map((prefix) => ({
      value: prefix,
      label: prefix || "NONE",
    }));
  const invoicePrefixOptions = getPrefixOptions("invoice");
  const quotationPrefixOptions = getPrefixOptions("quotation");
  const proformaInvoicePrefixOptions = getPrefixOptions("proformaInvoice");
  const [currentSelectedPrefix, setCurrentSelectedPrefix] = useState("invoice");
  const { isOpen, onClose, onOpen } = useDisclosure();
  const onOpenPrefixForm = (prefixType) => {
    setCurrentSelectedPrefix(prefixType);
    onOpen();
  };
  return (
    <Stack spacing={6}>
      <Flex justifyContent={"space-between"} alignItems={"center"}>
        <Heading fontSize={"lg"}>Transaction</Heading>
        <TransactionPopoverInstructions />
      </Flex>
      <Skeleton isLoaded={!loading}>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
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
                  const localeCode = currencies[value].localeCode;
                  formik.setFieldValue("localeCode", localeCode);
                }}
              />
            </FormControl>
            <FormControl isDisabled={!formik.values.organization}>
              <FormLabel>
                Invoice Prefix{" "}
                <IconButton
                  icon={<IoAdd />}
                  size={"xs"}
                  isRound
                  onClick={() => onOpenPrefixForm("invoice")}
                />
              </FormLabel>
              <Select
                onChange={({ value }) => {
                  formik.setFieldValue("invoice", value);
                }}
                options={invoicePrefixOptions}
                value={invoicePrefixOptions.find(
                  (prefixOption) => prefixOption.value === formik.values.invoice
                )}
              />
            </FormControl>
            <FormControl isDisabled={!formik.values.organization}>
              <FormLabel>
                Quotation Prefix{" "}
                <IconButton
                  icon={<IoAdd />}
                  size={"xs"}
                  isRound
                  onClick={() => onOpenPrefixForm("quotation")}
                />
              </FormLabel>

              <Select
                onChange={({ value }) => {
                  formik.setFieldValue("quotation", value);
                }}
                options={quotationPrefixOptions}
                value={quotationPrefixOptions.find(
                  (prefixOption) =>
                    prefixOption.value === formik.values.quotation
                )}
              />
            </FormControl>
            <FormControl isDisabled={!formik.values.organization}>
              <FormLabel>
                Proforma Invoice Prefix{" "}
                <IconButton
                  icon={<IoAdd />}
                  size={"xs"}
                  isRound
                  onClick={() => onOpenPrefixForm("proformaInvoice")}
                />
              </FormLabel>
              <Select
                onChange={({ value }) =>
                  formik.setFieldValue("proformaInvoice", value)
                }
                name="proformaInvoice"
                options={proformaInvoicePrefixOptions}
                value={proformaInvoicePrefixOptions.find(
                  (prefixOption) =>
                    prefixOption.value === formik.values.proformaInvoice
                )}
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
      <PrefixForm
        isOpen={isOpen}
        onClose={onClose}
        formik={formik}
        currentSelectedPrefix={currentSelectedPrefix}
      />
    </Stack>
  );
}
