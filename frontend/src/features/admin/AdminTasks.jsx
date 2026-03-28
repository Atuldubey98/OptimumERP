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
  Grid,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import moment from "moment";
import React, { useContext, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import SettingContext from "../../contexts/SettingContext";
import useAuth from "../../hooks/useAuth";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import instance from "../../instance";
import GoogleIcon from "../common/GoogleIcon";
import { GoPeople } from "react-icons/go";
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

function SMTPSetup() {
  const { t } = useTranslation("admin");
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
            {t("tasks.smtp.title")}
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={4}>
        <Box marginBottom={2}>
          <Alert status="info">
            <AlertIcon />
            {t("tasks.smtp.info")}
          </Alert>
        </Box>
        <Button
          isLoading={status === "connecting"}
          onClick={onConnectToGoogle}
          leftIcon={<GoogleIcon />}
        >
          {auth?.user?.googleId
            ? t("tasks.smtp.reconnect")
            : t("tasks.smtp.connect")}
        </Button>
      </AccordionPanel>
    </AccordionItem>
  );
}
function DefaultTermsForReceiptsForm({ formik }) {
  const { t } = useTranslation("admin");

  return (
    <AccordionItem>
      <AccordionButton>
        <Box fontWeight={"bold"} flex="1" textAlign="left">
          {t("tasks.default_terms.title")}
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={1}>
            <FormControl>
              <FormLabel>{t("tasks.default_terms.invoice")}</FormLabel>
              <Textarea
                value={formik.values.terms?.invoice}
                onChange={formik.handleChange}
                name="terms.invoice"
              />
            </FormControl>
            <FormControl>
              <FormLabel>{t("tasks.default_terms.quotations")}</FormLabel>
              <Textarea
                value={formik.values.terms?.quote}
                onChange={formik.handleChange}
                name="terms.quote"
              />
            </FormControl>
            <FormControl>
              <FormLabel>{t("tasks.default_terms.purchase_order")}</FormLabel>
              <Textarea
                value={formik.values.terms?.purchaseOrder}
                onChange={formik.handleChange}
                name="terms.purchaseOrder"
              />
            </FormControl>
            <FormControl>
              <FormLabel>{t("tasks.default_terms.proforma_invoice")}</FormLabel>
              <Textarea
                value={formik.values.terms?.proformaInvoice}
                onChange={formik.handleChange}
                name="terms.proformaInvoice"
              />
            </FormControl>
            <Button isLoading={formik.isSubmitting} type="submit" size={"sm"}>
              {t("actions.save")}
            </Button>
          </Stack>
        </form>
      </AccordionPanel>
    </AccordionItem>
  );
}

function MigrateFromOtherSoftware({ organization }) {
  const { t } = useTranslation("admin");
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
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
        <Button onClick={onOpen} leftIcon={<GoPeople />} variant={"primary"}>
          {t("tasks.import.party")}
        </Button>
        <PartyImportModal
          organization={organization}
          isOpen={isOpen}
          onClose={onClose}
        />
      </AccordionPanel>
    </AccordionItem>
  );
}
function PartyImportModal({ organization, isOpen, onClose }) {
  const { t } = useTranslation("admin");
  const toast = useToast();
  const [file, setFile] = useState(null);
  const handleDownloadSample = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      encodeURIComponent(
        `Name,"Billing Address","Shipping Address","GST No","PAN No"`,
      );
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "party_sample.csv");
    link.click();
    toast({
      title: t("tasks.import.download_started"),
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };
  const onUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: t("tasks.import.no_file_selected"),
        description: t("tasks.import.select_csv_prompt"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    const response = await instance.post(
      `/api/v1/organizations/${organization}/parties/import`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    toast({
      title: t("tasks.import.success_title"),
      description: response.data.message,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <form onSubmit={onUpload}>
        <ModalContent>
          <ModalHeader>{t("tasks.import.modal_title")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Text>{t("tasks.import.download_help")}</Text>
              <Button onClick={handleDownloadSample} variant="outline">
                {t("tasks.import.download_sample")}
              </Button>
              <Text>{t("tasks.import.upload_help")}</Text>
              <Input
                onChange={(e) => {
                  setFile(e.currentTarget.files[0]);
                }}
                type="file"
                accept=".csv"
                placeholder={t("tasks.import.select_csv_placeholder")}
              />
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              {t("actions.cancel")}
            </Button>
            <Button type="submit" colorScheme="blue">
              {t("tasks.import.submit")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
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
  const termsFormik = useFormik({
    initialValues: {
      terms: settingContext.setting?.receiptDefaults?.terms,
    },
    onSubmit: async (values, { setSubmitting }) => {
      await instance.patch(`/api/v1/organizations/${organization}/settings`, {
        "receiptDefaults.terms": values.terms,
      });
      await settingContext.fetchSetting();
      toast({
        title: t("toasts.success_title"),
        description: t("toasts.terms_default_set"),
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
        <Heading fontSize={"lg"}>{t("tasks.heading")}</Heading>
      </Box>
      <Accordion marginBlock={2} allowToggle>
        <FinancialYearCloseForm formik={formik} />
        <DefaultTermsForReceiptsForm formik={termsFormik} />
        {isCurrentUserOwnerOfOrganization &&
        isCurrentPlanGreaterThanFreePlan ? (
          <SMTPSetup />
        ) : null}
        <MigrateFromOtherSoftware organization={organization} />
      </Accordion>
    </Box>
  );
}
