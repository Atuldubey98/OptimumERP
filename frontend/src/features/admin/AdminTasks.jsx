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
import { FaGoogle } from "react-icons/fa";
import SettingContext from "../../contexts/SettingContext";
import useAuth from "../../hooks/useAuth";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import instance from "../../instance";
import GoogleIcon from "../common/GoogleIcon";
function FinancialYearCloseForm(props) {
  return (
    <AccordionItem>
      <AccordionButton>
        <Box fontWeight={"bold"} flex="1" textAlign="left">
          Close financial year
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <form onSubmit={props.formik.handleSubmit}>
          <Stack spacing={2}>
            <SimpleGrid gap={3} minChildWidth={300}>
              <FormControl>
                <FormLabel>Invoice Prefix</FormLabel>
                <Input
                  value={props.formik.values.transactionPrefix.invoice}
                  name="transactionPrefix.invoice"
                  onChange={props.formik.handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Quotation Prefix</FormLabel>
                <Input
                  value={props.formik.values.transactionPrefix.quotation}
                  name="transactionPrefix.quotation"
                  onChange={props.formik.handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Proforma Invoice Prefix</FormLabel>
                <Input
                  value={props.formik.values.transactionPrefix.proformaInvoice}
                  name="transactionPrefix.proformaInvoice"
                  onChange={props.formik.handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Purchase Order Prefix</FormLabel>
                <Input
                  value={props.formik.values.transactionPrefix.purchaseOrder}
                  name="transactionPrefix.purchaseOrder"
                  onChange={props.formik.handleChange}
                />
              </FormControl>
            </SimpleGrid>
            <Text fontSize={"sm"}>Next Financial year</Text>
            <SimpleGrid gap={3} minChildWidth={300}>
              <FormControl isRequired>
                <FormLabel>Start date</FormLabel>
                <Input
                  min={props.formik.values.financialYear.start}
                  value={props.formik.values.financialYear.start}
                  onChange={props.formik.handleChange}
                  name="financialYear.start"
                  type="date"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>End date</FormLabel>
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
              loadingText="Closing"
              isLoading={props.formik.isSubmitting}
            >
              Done
            </Button>
          </Stack>
        </form>
      </AccordionPanel>
    </AccordionItem>
  );
}

function SMTPSetup() {
  const auth = useAuth();
  const redirectUri = `${window.origin}/auth/google/admin`;
  const [status, setStatus] = useState("idle");
  const onConnectToGoogle = async () => {
    setStatus("connecting");
    const { data } = await instance.get("/api/v1/users/googleAuth");
    window.open(`${data.data}${redirectUri}`, "_self");
    setStatus("idle");
  };
  return (
    <AccordionItem>
      <h2>
        <AccordionButton>
          <Box fontWeight={"bold"} flex="1" textAlign="left">
            SMTP Setup
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={4}>
        <Box marginBottom={2}>
          <Alert status="info">
            <AlertIcon />
            SMTP currently supports only Google. Button below can be used to
            connect the google account to send receipts from the dashboard.
          </Alert>
        </Box>
        <Button
          isLoading={status === "connecting"}
          onClick={onConnectToGoogle}
          leftIcon={<GoogleIcon />}
        >
          {auth?.user?.googleId ? "Re-Connect" : "Connect"}
        </Button>
      </AccordionPanel>
    </AccordionItem>
  );
}
function DefaultTermsForReceiptsForm({ formik }) {
  return (
    <AccordionItem>
      <AccordionButton>
        <Box fontWeight={"bold"} flex="1" textAlign="left">
          Default Terms & Conditions
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={1}>
            <FormControl>
              <FormLabel>Invoice</FormLabel>
              <Textarea
                value={formik.values.terms?.invoice}
                onChange={formik.handleChange}
                name="terms.invoice"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Quotations</FormLabel>
              <Textarea
                value={formik.values.terms?.quote}
                onChange={formik.handleChange}
                name="terms.quote"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Purchase Order</FormLabel>
              <Textarea
                value={formik.values.terms?.purchaseOrder}
                onChange={formik.handleChange}
                name="terms.purchaseOrder"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Proforma Invoice</FormLabel>
              <Textarea
                value={formik.values.terms?.proformaInvoice}
                onChange={formik.handleChange}
                name="terms.proformaInvoice"
              />
            </FormControl>
            <Button isLoading={formik.isSubmitting} type="submit" size={"sm"}>
              Save
            </Button>
          </Stack>
        </form>
      </AccordionPanel>
    </AccordionItem>
  );
}
export default function AdminTasks({ organization }) {
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
  const termsFormik = useFormik({
    initialValues: {
      terms: settingContext.setting?.receiptDefaults?.terms,
    },
    onSubmit: async (values, { setSubmitting }) => {
      await instance.patch(`/api/v1/organizations/${organization}/settings`, {
        receiptDefaults: {
          ...(settingContext.setting?.receiptDefaults || {}),
          terms: values.terms,
        },
      });
      await settingContext.fetchSetting();
      toast({
        title: "Success",
        description: "Terms default set",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setSubmitting(false);
    },
  });
  const isCurrentUserOwnerOfOrganization =
    auth.user?.currentPlan?.purchasedBy === auth?.user._id;
  const isCurrentPlanGreaterThanFreePlan =
    auth?.user.currentPlan?.plan !== "free";
  return (
    <Box>
      <Box bg={bg} p={3}>
        <Heading fontSize={"lg"}>Admin tasks</Heading>
      </Box>
      <Accordion marginBlock={2} allowToggle>
        <FinancialYearCloseForm formik={formik} />
        <DefaultTermsForReceiptsForm formik={termsFormik} />
        {isCurrentUserOwnerOfOrganization &&
        isCurrentPlanGreaterThanFreePlan ? (
          <SMTPSetup />
        ) : null}
      </Accordion>
    </Box>
  );
}
