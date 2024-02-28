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
import { useContext, useEffect } from "react";
import SettingContext from "../../../contexts/SettingContext";
import instance from "../../../instance";

export default function TransactionPrefix() {
  const { authorizedOrgs: organizations, loading } = useOrganizations();
  const settingContext = useContext(SettingContext);
  const toast = useToast();
  const formik = useFormik({
    initialValues: {
      organization: "",
      invoice: "",
      quotation: "",
    },
    onSubmit: async (values) => {
      if (!values.organization) return;
      const { data } = await instance.patch(
        `/api/v1/organizations/${values.organization}/settings`,
        {
          transactionPrefix: {
            invoice: values.invoice,
            quotation: values.quotation,
          },
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
    },
  });
  useEffect(() => {
    (async () => {
      if (!formik.values.organization) {
        formik.setValues({
          organization: "",
          invoice: "",
          quotation: "",
        });
        return;
      }
      const { data } = await instance.get(
        `/api/v1/organizations/${formik.values.organization}/settings`
      );
      formik.setValues({
        organization: formik.values.organization,
        invoice: data.data.transactionPrefix.invoice,
        quotation: data.data.transactionPrefix.quotation,
      });
    })();
  }, [formik.values.organization]);
  return (
    <Stack spacing={6}>
      <Heading>Transaction Prefixes</Heading>
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
            <Button type="submit" colorScheme="blue">
              Update
            </Button>
          </Flex>
        </form>
      </Skeleton>
    </Stack>
  );
}
