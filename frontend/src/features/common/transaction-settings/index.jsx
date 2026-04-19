import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useFormik } from "formik";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { GoOrganization } from "react-icons/go";
import SettingContext from "../../../contexts/SettingContext";
import useOrganizations from "../../../hooks/useOrganizations";
import instance from "../../../instance";
import MainLayout from "../main-layout";
import PrintSettings from "./PrintSettings";
import TransactionPrefix from "./TransactionsPrefix";
import AdminLayout from "../auth-layout/AdminLayout";
export default function TransactionSettingsPage() {
  const { t } = useTranslation("common");
  const { authorizedOrgs: organizations, loading } = useOrganizations();
  const settingContext = useContext(SettingContext);
  const toast = useToast();
  const printFormik = useFormik({
    initialValues: {
      bank: false,
      upiQr: false,
      defaultTemplate: "simple",
    },
    onSubmit: async (values, { setSubmitting }) => {
      const settingsUrl = `/api/v1/organizations/${formik.values.organization}/settings`;
      await instance.patch(settingsUrl, {
        printSettings: values,
      });
      settingContext.fetchSetting()
      toast({
        title: t("common_ui.toasts.success"),
        description: t("common_ui.toasts.setting_updated"),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setSubmitting(false);
    },
  });
  const organizationOptions = organizations.map((authOrg) => ({
    value: authOrg.org._id,
    label: authOrg.org.name,
    disabled: authOrg.role !== "admin",
  }));
  const formik = useFormik({
    initialValues: {
      organization: "",
      invoice: "",
      quotation: "",
      proformaInvoice: "",
      localeCode: "en-IN",
      currency: "INR",
      startDate: "",
      endDate: "",
      prefixes: {
        invoice: [""],
        quotation: [""],
        purchaseOrder: [""],
        proformaInvoice: [""],
      },
    },
    onSubmit: async (values, { setSubmitting }) => {
      if (!values.organization) return;
      const settingsUrl = `/api/v1/organizations/${values.organization}/settings`;
      const { data } = await instance.patch(settingsUrl, {
        transactionPrefix: {
          invoice: values.invoice,
          quotation: values.quotation,
          purchaseOrder: values.purchaseOrder,
          proformaInvoice: values.proformaInvoice || "",
        },
        currency: values.currency,
        localeCode: values.localeCode,
        prefixes: values.prefixes,
      });

      const currentOrg = localStorage.getItem("organization");
      if (
        currentOrg === values.organization &&
        settingContext.onSetSettingForOrganization
      )
        settingContext.fetchSetting();

      toast({
        title: t("common_ui.toasts.success"),
        description: t("common_ui.toasts.setting_updated"),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setSubmitting(false);
    },
  });
  return (
    
      <AdminLayout>
        <Stack spacing={3}>
          {loading ? (
            <Flex p={4} justifyContent={"center"} alignItems={"center"}>
              <Spinner />
            </Flex>
          ) : (
            <Box p={3}>
              <FormControl>
                <FormLabel fontWeight={"bold"}>{t("common_ui.organization")}</FormLabel>
                <Select
                  value={organizationOptions.find(
                    (org) => org.value === formik.values.organization
                  )}
                  onChange={({ value }) => {
                    formik.setFieldValue("organization", value);
                  }}
                  isOptionDisabled={({ disabled }) => disabled}
                  options={organizationOptions}
                  name="organization"
                />
              </FormControl>
            </Box>
          )}
          <SimpleGrid gap={8} minChildWidth={300}>
            {formik.values.organization ? (
              <Tabs size={"sm"}>
                <TabList>
                  <Tab>{t("common_ui.transaction_settings.configuration")}</Tab>
                  <Tab>{t("common_ui.transaction_settings.transaction")}</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <Box>
                      <PrintSettings
                        printFormik={printFormik}
                        formik={formik}
                        loading={loading}
                      />
                    </Box>
                  </TabPanel>
                  <TabPanel>
                    <Box>
                      <TransactionPrefix
                        formik={formik}
                        loading={loading}
                        printFormik={printFormik}
                      />
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            ) : (
              <Flex
                minH={"50svh"}
                justifyContent={"center"}
                alignItems={"center"}
                flexDir={"column"}
              >
                <GoOrganization size={80} color="lightgray" />
                <Heading color={"gray.300"} fontSize={"2xl"}>
                  {t("common_ui.select_organization")}
                </Heading>
              </Flex>
            )}
          </SimpleGrid>
        </Stack>
      </AdminLayout>
    
  );
}
