import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Heading,
  Input,
  SimpleGrid,
  Spinner,
  Textarea
} from "@chakra-ui/react";
import { FormikProvider } from "formik";
import { AiOutlineSave } from "react-icons/ai";
import { useParams } from "react-router-dom";
import { invoiceStatusList } from "../../../constants/invoice";
import useInvoicesForm from "../../../hooks/useInvoicesForm";
import instance from "../../../instance";
import MainLayout from "../../common/main-layout";
import DateField from "../../estimates/create/DateField";
import DescriptionField from "../../estimates/create/DescriptionField";
import ItemsList from "../../estimates/create/ItemList";
import SelectStatus from "../../estimates/create/SelectStatus";
import TermsAndCondtions from "../../estimates/create/TermsConditions";
import TotalsBox from "../../estimates/create/TotalsBox";
import { defaultInvoiceItem } from "../../estimates/create/data";
import CustomerSelectBill from "./CustomerSelectBill";
export default function CreateInvoicePage() {
  const { formik, status } = useInvoicesForm();
  const { orgId } = useParams();
  const loading = status === "loading";
  const promiseOptions = async (searchQuery) => {
    const { data } = await instance.get(
      `/api/v1/organizations/${orgId}/customers/search`,
      {
        params: {
          keyword: searchQuery,
        },
      }
    );
    return data.data.map((customer) => ({
      value: customer,
      label: customer.name,
    }));
  };

  return (
    <MainLayout>
      <Box p={5}>
        <FormikProvider value={formik}>
          {loading ? (
            <Flex justifyContent={"center"} alignItems={"center"}>
              <Spinner size={"md"} />
            </Flex>
          ) : (
            <form onSubmit={formik.handleSubmit}>
              <Flex gap={5} justifyContent={"flex-end"} alignItems={"center"}>
                <Button
                  leftIcon={<AiOutlineSave />}
                  isLoading={formik.isSubmitting || loading}
                  type="submit"
                  colorScheme="teal"
                  variant="solid"
                >
                  Save
                </Button>
              </Flex>
              <Grid gap={4}>
                <Heading fontSize={"xl"}>Customer</Heading>
                <FormControl isRequired>
                  <FormLabel>Bill to</FormLabel>
                  <CustomerSelectBill formik={formik} />
                  <FormErrorMessage>{formik.errors.customer}</FormErrorMessage>
                </FormControl>
                {formik.values.customer ? (
                  <FormControl isRequired>
                    <FormLabel>Billing Address</FormLabel>
                    <Textarea
                      name="billingAddress"
                      onChange={formik.handleChange}
                      value={formik.values.billingAddress}
                    />
                  </FormControl>
                ) : null}
                <Heading fontSize={"xl"}>Invoice Details</Heading>
                <SimpleGrid gap={2} minChildWidth={300}>
                  <FormControl
                    isRequired
                    isInvalid={formik.errors.quoteNo && formik.touched.quoteNo}
                  >
                    <FormLabel>Invoice No.</FormLabel>
                    <Input
                      type="number"
                      name="invoiceNo"
                      onChange={formik.handleChange}
                      value={formik.values.invoiceNo}
                    />
                    <FormErrorMessage>
                      {formik.errors.invoiceNo}
                    </FormErrorMessage>
                  </FormControl>
                  <DateField formik={formik} />
                  <SelectStatus
                    formik={formik}
                    statusList={invoiceStatusList}
                  />
                  <FormControl>
                    <FormLabel>PO Number</FormLabel>
                    <Input
                      value={formik.values.poNo}
                      onChange={formik.handleChange}
                      name="poNo"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>PO Date</FormLabel>
                    <Input
                      value={formik.values.poDate}
                      onChange={formik.handleChange}
                      name="poDate"
                      type="date"
                    />
                  </FormControl>
                </SimpleGrid>
                <Heading fontSize={"xl"}>Items</Heading>
                <ItemsList formik={formik} defaultItem={defaultInvoiceItem} />
                <TotalsBox quoteItems={formik.values.items} />
                <DescriptionField formik={formik} />
                <TermsAndCondtions formik={formik} />
              </Grid>
            </form>
          )}
        </FormikProvider>
      </Box>
    </MainLayout>
  );
}
