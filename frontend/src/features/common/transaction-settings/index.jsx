import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  SimpleGrid,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useFormik } from "formik";
import { useContext } from "react";
import SettingContext from "../../../contexts/SettingContext";
import useOrganizations from "../../../hooks/useOrganizations";
import instance from "../../../instance";
import MainLayout from "../main-layout";
import PrintSettings from "./PrintSettings";
import TransactionPrefix from "./TransactionsPrefix";
export default function TransactionSettingsPage() {
  const { authorizedOrgs: organizations, loading } = useOrganizations();
  const settingContext = useContext(SettingContext);
  const toast = useToast();
  const printFormik = useFormik({
    initialValues: {
      bank: false,
      upiQr: false,
    },
    onSubmit: async (values, { setSubmitting }) => {
      const settingsUrl = `/api/v1/organizations/${formik.values.organization}/settings`;

      await instance.patch(settingsUrl, {
        printSettings: values,
      });
      toast({
        title: "Success",
        description: "Setting updated",
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
      currency: "INR",
      startDate: "",
      endDate: "",
    },
    onSubmit: async (values, { setSubmitting }) => {
      if (!values.organization) return;
      const settingsUrl = `/api/v1/organizations/${values.organization}/settings`;
      const { data } = await instance.patch(settingsUrl, {
        transactionPrefix: {
          invoice: values.invoice,
          quotation: values.quotation,
        },
        currency: values.currency,
        financialYear: {
          start: values.startDate,
          end: values.endDate,
        },
      });
      const currentOrg = localStorage.getItem("organization");
      if (
        currentOrg === values.organization &&
        settingContext.onSetSettingForOrganization
      )
        settingContext.onSetSettingForOrganization(data.data);

      toast({
        title: "Success",
        description: "Setting updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setSubmitting(false);
    },
  });
  return (
    <MainLayout>
      <Stack spacing={3} p={5}>
        <Box>
          <FormControl>
            <FormLabel fontWeight={"bold"}>Organization</FormLabel>
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
        <SimpleGrid gap={4} minChildWidth={300}>
          {formik.values.organization ? (
            <>
              <Box
                border={"1px"}
                borderColor={"gray.200"}
                maxW={"xl"}
                borderRadius={"md"}
                p={5}
                boxShadow={"md"}
              >
                <TransactionPrefix
                  formik={formik}
                  loading={loading}
                  printFormik={printFormik}
                />
              </Box>
              <Flex justifyContent={"center"} alignItems={"center"}>
                <Box
                  border={"1px"}
                  borderColor={"gray.200"}
                  width={"100%"}
                  maxW={"xl"}
                  borderRadius={"md"}
                  p={5}
                  boxShadow={"md"}
                >
                  <PrintSettings
                    printFormik={printFormik}
                    formik={formik}
                    loading={loading}
                  />
                </Box>
              </Flex>
            </>
          ) : null}
        </SimpleGrid>
      </Stack>
    </MainLayout>
  );
}
