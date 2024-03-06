import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Skeleton,
  Stack,
  useToast,
} from "@chakra-ui/react";
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
        }
      );
      const currentOrg = localStorage.getItem("organization");
      if (
        currentOrg === values.organization &&
        settingContext.onSetSettingForOrganization
      ) {
        settingContext.onSetSettingForOrganization(data.data);
      }
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
      });
      setStatus("success");
    })();
  }, [formik.values.organization]);
  const currencyCodes = Object.keys(currencies);
  return (
    <Stack spacing={6}>
      <Heading fontSize={"lg"}>Transaction Prefixes</Heading>
      <Skeleton isLoaded={!loading}>
        <form onSubmit={formik.handleSubmit}>
          <FormControl>
            <FormLabel>Organization</FormLabel>
            <Select
              value={formik.values.organization}
              onChange={formik.handleChange}
              name="organization"
            >
              <option value={""}>Select an organization</option>
              {organizations.map((organization) => (
                <option
                  disabled={organization.role !== "admin"}
                  value={organization.org._id}
                  key={organization.org._id}
                >
                  {organization.org.name}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl isDisabled={!formik.values.organization}>
            <FormLabel>Currency</FormLabel>
            <Select
              name="currency"
              value={formik.values.currency}
              onChange={formik.handleChange}
            >
              {currencyCodes.map((currency) => (
                <option
                  key={currency}
                  value={currency}
                >{`${currency} - ${currencies[currency].symbol}`}</option>
              ))}
            </Select>
          </FormControl>
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
