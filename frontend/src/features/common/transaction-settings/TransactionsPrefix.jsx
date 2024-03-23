import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Skeleton,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useFormik } from "formik";
import useOrganizations from "../../../hooks/useOrganizations";
import { useContext, useEffect, useState } from "react";
import SettingContext from "../../../contexts/SettingContext";
import instance from "../../../instance";
import currencies from "../../../assets/currency.json";
export default function TransactionPrefix() {
  const { authorizedOrgs: organizations, loading } = useOrganizations();
  const settingContext = useContext(SettingContext);
  const toast = useToast();
  const [status, setStatus] = useState("idle");
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
      const { data } = await instance.patch(
        `/api/v1/organizations/${values.organization}/settings`,
        {
          transactionPrefix: {
            invoice: values.invoice,
            quotation: values.quotation,
          },
          currency: values.currency,
          financialYear: {
            start: values.startDate,
            end: values.endDate,
          },
        }
      );
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
  useEffect(() => {
    (async () => {
      if (!formik.values.organization) {
        formik.setValues({
          organization: "",
          invoice: "",
          currency: "INR",
          quotation: "",
          startDate: "",
          endDate: "",
        });
        return;
      }
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${formik.values.organization}/settings`
      );
      formik.setValues({
        organization: formik.values.organization,
        invoice: data.data.transactionPrefix.invoice,
        quotation: data.data.transactionPrefix.quotation,
        currency: data.data.currency || "INR",
        endDate: new Date(data.data.financialYear.end)
          .toISOString()
          .split("T")[0],
        startDate: new Date(data.data.financialYear.start)
          .toISOString()
          .split("T")[0],
      });
      setStatus("success");
    })();
  }, [formik.values.organization]);
  const currencyCodes = Object.keys(currencies);
  const organizationOptions = organizations.map((authOrg) => ({
    value: authOrg.org._id,
    label: authOrg.org.name,
    disabled: authOrg.role !== "admin",
  }));
  const currencyOptions = currencyCodes.map((currency) => ({
    label: `${currency} - ${currencies[currency].symbol}`,
    value: currency,
  }));
  return (
    <Stack spacing={6}>
      <Heading fontSize={"lg"}>Transaction</Heading>
      <Skeleton isLoaded={!loading}>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
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
              ></Select>
            </FormControl>
            <FormControl isDisabled={!formik.values.organization}>
              <FormLabel fontWeight={"bold"}>Currency</FormLabel>
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
              <FormLabel fontWeight={"bold"}>Invoice Prefix</FormLabel>
              <Input
                name="invoice"
                value={formik.values.invoice}
                onChange={formik.handleChange}
                placeholder="ABC-ORG/23-24/XXXX"
              />
            </FormControl>
            <FormControl isDisabled={!formik.values.organization}>
              <FormLabel fontWeight={"bold"}>Quotation Prefix</FormLabel>
              <Input
                name="quotation"
                value={formik.values.quotation}
                onChange={formik.handleChange}
                placeholder="ABC-ORG/23-24/XXXX"
              />
            </FormControl>
            <Box>
              <FormControl fontWeight={"bold"}>Fiscal Year</FormControl>
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
