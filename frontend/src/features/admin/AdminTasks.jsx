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
  Flex,
  Icon,
  useDisclosure,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import moment from "moment";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiCheckCircle } from "react-icons/fi";
import SettingContext from "../../contexts/SettingContext";
import useAuth from "../../hooks/useAuth";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import instance from "../../instance";
import ImportTasks from "./ImportTasks";
import TemplateTasks from "./TemplateTasks";
import AlertModal from "../common/AlertModal";

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
              <FormControl>
                <FormLabel>
                  {t("tasks.financial_year.payment_voucher_prefix")}
                </FormLabel>
                <Input
                  value={props.formik.values.transactionPrefix.paymentVoucher}
                  name="transactionPrefix.paymentVoucher"
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
              isLoading={props.formik.isSubmitting || props.isClosing}
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
  const reportBg = useColorModeValue("white", "gray.800");
  const { financialYear, formatSmallestUnitWithSymbol } = useCurrentOrgCurrency();
  const settingContext = useContext(SettingContext);
  const toast = useToast();
  const auth = useAuth();
  const [closedSummary, setClosedSummary] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const {
    isOpen: isConfirmOpen,
    onOpen: onOpenConfirm,
    onClose: onCloseConfirm,
  } = useDisclosure();

  const formik = useFormik({
    initialValues: {
      transactionPrefix: {
        invoice: "",
        quotation: "",
        purchaseOrder: "",
        proformaInvoice: "",
        paymentVoucher: "",
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
    onSubmit: (data, { setSubmitting }) => {
      onOpenConfirm();
      setSubmitting(false);
    },
  });

  const confirmCloseFinancialYear = async () => {
    setIsClosing(true);
    try {
      const response = await instance.post(
        `/api/v1/organizations/${organization}/closeFinancialYear`,
        formik.values,
      );
      
      if (response.data && response.data.summary) {
        setClosedSummary(response.data.summary);
      }

      toast({
        title: t("toasts.success_title"),
        description: t("toasts.financial_year_closed"),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      formik.resetForm();
      await settingContext.fetchSetting();
    } catch (err) {
      toast({
        title: t("toasts.error_title"),
        description: err.response?.data?.message || t("toasts.error_occurred"),
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsClosing(false);
      onCloseConfirm();
    }
  };

  const { user } = useAuth();
  const currentFeatures = user?.features || {};
  const import_bulk = currentFeatures?.import_bulk ?? false;
  return (
    <Box pt={2}>
      <Box bg={bg} p={3}>
        <Heading fontSize={"lg"}>{t("tasks.heading")}</Heading>
      </Box>
      <Accordion marginBlock={2} allowToggle>
        <FinancialYearCloseForm formik={formik} isClosing={isClosing} />
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

      {closedSummary && (
        <Box 
          mt={6} 
          p={5} 
          borderWidth="1px" 
          borderRadius="lg" 
          bg={reportBg}
          boxShadow="md"
        >
          <Flex align="center" mb={4}>
            <Icon as={FiCheckCircle} color="green.500" w={6} h={6} mr={2} />
            <Heading size="md">{t("tasks.financial_year.closure_report_title") || "Financial Year Closure Summary"}</Heading>
          </Flex>
          <Text fontSize="sm" color="gray.500" mb={4}>
            The previous financial year ({financialYear.start ? moment(financialYear.start).format("YYYY-MM-DD") : ""} to {financialYear.end ? moment(financialYear.end).format("YYYY-MM-DD") : ""}) was closed successfully. Here are the total statistics recorded:
          </Text>
          
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={4} mb={4}>
            <Box p={4} borderWidth="1px" borderRadius="md" bg={useColorModeValue("blue.50", "blue.900")}>
              <Flex justify="space-between" align="center">
                <Text fontSize="xs" fontWeight="bold" uppercase>{t("tasks.financial_year.total_sales") || "Total Sales"}</Text>
                <Icon as={FiTrendingUp} color="blue.500" />
              </Flex>
              <Text fontSize="lg" fontWeight="bold" mt={2}>
                {formatSmallestUnitWithSymbol(closedSummary.invoices.totalAmount)}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {closedSummary.invoices.count} {closedSummary.invoices.count === 1 ? "Invoice" : "Invoices"}
              </Text>
            </Box>

            <Box p={4} borderWidth="1px" borderRadius="md" bg={useColorModeValue("orange.50", "orange.900")}>
              <Flex justify="space-between" align="center">
                <Text fontSize="xs" fontWeight="bold" uppercase>{t("tasks.financial_year.total_purchases") || "Total Purchases"}</Text>
                <Icon as={FiTrendingDown} color="orange.500" />
              </Flex>
              <Text fontSize="lg" fontWeight="bold" mt={2}>
                {formatSmallestUnitWithSymbol(closedSummary.purchases.totalAmount)}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {closedSummary.purchases.count} {closedSummary.purchases.count === 1 ? "Purchase" : "Purchases"}
              </Text>
            </Box>

            <Box p={4} borderWidth="1px" borderRadius="md" bg={useColorModeValue("red.50", "red.900")}>
              <Flex justify="space-between" align="center">
                <Text fontSize="xs" fontWeight="bold" uppercase>{t("tasks.financial_year.total_expenses") || "Total Expenses"}</Text>
                <Icon as={FiTrendingDown} color="red.500" />
              </Flex>
              <Text fontSize="lg" fontWeight="bold" mt={2}>
                {formatSmallestUnitWithSymbol(closedSummary.expenses.totalAmount)}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {closedSummary.expenses.count} {closedSummary.expenses.count === 1 ? "Expense" : "Expenses"}
              </Text>
            </Box>

            <Box p={4} borderWidth="1px" borderRadius="md" bg={useColorModeValue("green.50", "green.900")}>
              <Flex justify="space-between" align="center">
                <Text fontSize="xs" fontWeight="bold" uppercase>{t("tasks.financial_year.total_receipts") || "Total Receipts"}</Text>
                <Icon as={FiTrendingUp} color="green.500" />
              </Flex>
              <Text fontSize="lg" fontWeight="bold" mt={2}>
                {formatSmallestUnitWithSymbol(closedSummary.receipts.totalAmount)}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {closedSummary.receipts.count} {closedSummary.receipts.count === 1 ? "Receipt" : "Receipts"}
              </Text>
            </Box>

            <Box p={4} borderWidth="1px" borderRadius="md" bg={useColorModeValue("purple.50", "purple.900")}>
              <Flex justify="space-between" align="center">
                <Text fontSize="xs" fontWeight="bold" uppercase>{t("tasks.financial_year.total_payments") || "Total Payments"}</Text>
                <Icon as={FiTrendingDown} color="purple.500" />
              </Flex>
              <Text fontSize="lg" fontWeight="bold" mt={2}>
                {formatSmallestUnitWithSymbol(closedSummary.payments.totalAmount)}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {closedSummary.payments.count} {closedSummary.payments.count === 1 ? "Payment" : "Payments"}
              </Text>
            </Box>

            <Box p={4} borderWidth="1px" borderRadius="md" bg={useColorModeValue("teal.50", "teal.900")}>
              <Flex justify="space-between" align="center">
                <Text fontSize="xs" fontWeight="bold" uppercase>Net Cashflow</Text>
                <Icon as={FiDollarSign} color="teal.500" />
              </Flex>
              <Text fontSize="lg" fontWeight="bold" mt={2} color={closedSummary.receipts.totalAmount - closedSummary.payments.totalAmount >= 0 ? "green.500" : "red.500"}>
                {formatSmallestUnitWithSymbol(closedSummary.receipts.totalAmount - closedSummary.payments.totalAmount)}
              </Text>
              <Text fontSize="xs" color="gray.500">
                Receipts minus Payments
              </Text>
            </Box>
          </SimpleGrid>
          <Button size="sm" onClick={() => setClosedSummary(null)}>Dismiss Report</Button>
        </Box>
      )}

      <AlertModal
        confirmDisable={isClosing}
        body={t("tasks.financial_year.confirm_modal_body") || "Are you sure you want to close the financial year? This action is irreversible."}
        header={t("tasks.financial_year.confirm_modal_header") || "Close Financial Year"}
        isOpen={isConfirmOpen}
        onClose={onCloseConfirm}
        onConfirm={confirmCloseFinancialYear}
        buttonLabel={t("tasks.financial_year.confirm_modal_btn") || "Close Year"}
      />
    </Box>
  );
}
