import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import moment from "moment";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import SettingContext from "../../contexts/SettingContext";
import useAuth from "../../hooks/useAuth";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import instance from "../../instance";
import ImportTasks from "./ImportTasks";
import TemplateTasks from "./TemplateTasks";

function FinancialYearCloseForm(props) {
  const { t } = useTranslation("admin");

  return (
    <AccordionItem>
      <AccordionButton>
        <Box fontWeight={"bold"} flex="1" textAlign="left">
          {t("tasks.financial_year.close")}
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <form onSubmit={props.formik.handleSubmit}>
          <Stack spacing={2}>
            <SimpleGrid gap={3} minChildWidth={300}>
              <FormControl>
                <FormLabel>{t("tasks.financial_year.invoice_prefix")}</FormLabel>
                <Input
                  value={props.formik.values.transactionPrefix.invoice}
                  name="transactionPrefix.invoice"
                  onChange={props.formik.handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t("tasks.financial_year.quotation_prefix")}</FormLabel>
                <Input
                  value={props.formik.values.transactionPrefix.quotation}
                  name="transactionPrefix.quotation"
                  onChange={props.formik.handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>
                  {t("tasks.financial_year.proforma_invoice_prefix")}
                </FormLabel>
                <Input
                  value={props.formik.values.transactionPrefix.proformaInvoice}
                  name="transactionPrefix.proformaInvoice"
                  onChange={props.formik.handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>
                  {t("tasks.financial_year.purchase_order_prefix")}
                </FormLabel>
                <Input
                  value={props.formik.values.transactionPrefix.purchaseOrder}
                  name="transactionPrefix.purchaseOrder"
                  onChange={props.formik.handleChange}
                />
              </FormControl>
            </SimpleGrid>
            <Text fontSize={"sm"}>{t("tasks.financial_year.next")}</Text>
            <SimpleGrid gap={3} minChildWidth={300}>
              <FormControl isRequired>
                <FormLabel>{t("tasks.financial_year.start_date")}</FormLabel>
                <Input
                  min={props.formik.values.financialYear.start}
                  value={props.formik.values.financialYear.start}
                  onChange={props.formik.handleChange}
                  name="financialYear.start"
                  type="date"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t("tasks.financial_year.end_date")}</FormLabel>
                <Input
                  min={props.formik.values.financialYear.start}
                  value={props.formik.values.financialYear.end}
                  onChange={props.formik.handleChange}
                  name="financialYear.end"
                  type="date"
                />
              </FormControl>
            </SimpleGrid>
            <Button
              size={"sm"}
              type="submit"
              loadingText={t("tasks.financial_year.closing")}
              isLoading={props.formik.isSubmitting}
            >
              {t("tasks.financial_year.done")}
            </Button>
          </Stack>
        </form>
      </AccordionPanel>
    </AccordionItem>
  );
}

export default function AdminTasks({ organization }) {
  const { t } = useTranslation("admin");
  const bg = useColorModeValue("gray.100", "gray.700");
  const { financialYear } = useCurrentOrgCurrency();
  const settingContext = useContext(SettingContext);
  const toast = useToast();
  const auth = useAuth();
  const formik = useFormik({
    initialValues: {
      transactionPrefix: {
        invoice: "",
        quotation: "",
        purchaseOrder: "",
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
        data,
      );
      toast({
        title: t("toasts.success_title"),
        description: t("toasts.financial_year_closed"),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      formik.resetForm();
      await settingContext.fetchSetting();
      setSubmitting(false);
    },
  });

  const { user } = useAuth();
  const currentFeatures = user?.features || {};
  const import_bulk = currentFeatures?.import_bulk ?? false;
  return (
    <Box pt={2}>
      <Box bg={bg} p={3}>
        <Heading fontSize={"lg"}>{t("tasks.heading")}</Heading>
      </Box>
      <Accordion marginBlock={2} allowToggle>
        <FinancialYearCloseForm formik={formik} />
        <TemplateTasks organization={organization} />
        {
          import_bulk && (
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box fontWeight={"bold"} flex="1" textAlign="left">
                    {t("tasks.import.title")}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <ImportTasks organization={organization} />
              </AccordionPanel>
            </AccordionItem>
          )
        }
      </Accordion>
    </Box>
  );
}
