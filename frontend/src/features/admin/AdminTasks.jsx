import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import moment from "moment";
import React, { useContext } from "react";
import SettingContext from "../../contexts/SettingContext";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import instance from "../../instance";
export default function AdminTasks({ organization }) {
  const bg = useColorModeValue("gray.100", "gray.700");
  const { financialYear } = useCurrentOrgCurrency();
  const settingContext = useContext(SettingContext);
  const toast = useToast();
  const formik = useFormik({
    initialValues: {
      transactionPrefix: {
        invoice: "",
        quotation: "",
        purchaseOrder: "",
        saleOrder: "",
        proformaInvoice: "",
      },
      financialYear: {
        start: financialYear.start
          ? moment(financialYear.start).format("YYYY-MM-DD")
          : "",
        end: financialYear.end
          ? moment(financialYear.end).format("YYYY-MM-DD")
          : "",
      },
    },
    onSubmit: async (data, { setSubmitting }) => {
      await instance.post(
        `/api/v1/organizations/${organization}/closeFinancialYear`,
        data
      );
      toast({
        title: "Success",
        description: "Financial year closed",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      formik.resetForm();
      await settingContext.fetchSetting();
      setSubmitting(false);
    },
  });

  return (
    <Box>
      <Box bg={bg} p={3}>
        <Heading fontSize={"lg"}>Admin tasks</Heading>
      </Box>
      <Accordion marginBlock={2} allowToggle>
        <AccordionItem>
          <AccordionButton>
            <Box  as="span" flex="1" textAlign="left">
              Close financial year
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <form onSubmit={formik.handleSubmit}>
              <Stack spacing={2}>
                <SimpleGrid gap={3} minChildWidth={300}>
                  <FormControl>
                    <FormLabel>Invoice Prefix</FormLabel>
                    <Input
                      value={formik.values.transactionPrefix.invoice}
                      name="transactionPrefix.invoice"
                      onChange={formik.handleChange}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Quotation Prefix</FormLabel>
                    <Input
                      value={formik.values.transactionPrefix.quotation}
                      name="transactionPrefix.quotation"
                      onChange={formik.handleChange}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Proforma Invoice Prefix</FormLabel>
                    <Input
                      value={formik.values.transactionPrefix.proformaInvoice}
                      name="transactionPrefix.proformaInvoice"
                      onChange={formik.handleChange}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Purchase Order Prefix</FormLabel>
                    <Input
                      value={formik.values.transactionPrefix.purchaseOrder}
                      name="transactionPrefix.purchaseOrder"
                      onChange={formik.handleChange}
                    />
                  </FormControl>
                </SimpleGrid>
                <Text fontSize={"sm"}>Next Financial year</Text>
                <SimpleGrid gap={3} minChildWidth={300}>
                  <FormControl isRequired>
                    <FormLabel>Start date</FormLabel>
                    <Input
                      min={formik.values.financialYear.start}
                      value={formik.values.financialYear.start}
                      onChange={formik.handleChange}
                      name="financialYear.start"
                      type="date"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>End date</FormLabel>
                    <Input
                      min={formik.values.financialYear.start}
                      value={formik.values.financialYear.end}
                      onChange={formik.handleChange}
                      name="financialYear.end"
                      type="date"
                    />
                  </FormControl>
                </SimpleGrid>
              </Stack>
              <Flex
                marginBlock={2}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <Button
                  size={"sm"}
                  type="submit"
                  loadingText="Closing"
                  colorScheme="blue"
                  isLoading={formik.isSubmitting}
                  margin={"auto"}
                >
                  Done
                </Button>
              </Flex>
            </form>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
}
