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
  InputGroup,
  SimpleGrid,
  Spinner,
  Textarea,
} from "@chakra-ui/react";
import { FormikProvider } from "formik";
import { AiOutlineSave } from "react-icons/ai";
import { invoiceStatusList } from "../../../constants/invoice";
import useProformaInvoicesForm from "../../../hooks/useProformaInvoicesForm";
import NumberInputInteger from "../../common/NumberInputInteger";
import MainLayout from "../../common/main-layout";
import DateField from "../../estimates/create/DateField";
import DescriptionField from "../../estimates/create/DescriptionField";
import ItemsList from "../../estimates/create/ItemList";
import SelectStatus from "../../estimates/create/SelectStatus";
import TermsAndCondtions from "../../estimates/create/TermsConditions";
import TotalsBox from "../../estimates/create/TotalsBox";
import { defaultInvoiceItem } from "../../estimates/create/data";
import PartySelectBill from "../../invoices/create/PartySelectBill";

import useLimitsInFreePlan from "../../../hooks/useLimitsInFreePlan";
import PrefixFormField from "../../common/PrefixFormField";
export default function ProformaInvoiceFormPage() {
  const { formik, status } = useProformaInvoicesForm();
  const loading = status === "loading";
  const { disable } = useLimitsInFreePlan({
    key: "proformaInvoices",
  });
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
                  isDisabled={formik.values._id ? false : disable}
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
                <Heading fontSize={"xl"}>Party</Heading>
                <FormControl
                  isInvalid={formik.errors.party && formik.touched.party}
                  isRequired
                >
                  <FormLabel>Bill to</FormLabel>
                  <PartySelectBill formik={formik} />
                  <FormErrorMessage>{formik.errors.party}</FormErrorMessage>
                </FormControl>
                {formik.values.party ? (
                  <FormControl
                    isInvalid={
                      formik.errors.billingAddress &&
                      formik.touched.billingAddress
                    }
                    isRequired
                  >
                    <FormLabel>Billing Address</FormLabel>
                    <Textarea
                      name="billingAddress"
                      onChange={formik.handleChange}
                      value={formik.values.billingAddress}
                    />
                    <FormErrorMessage>
                      {formik.errors.billingAddress}
                    </FormErrorMessage>
                  </FormControl>
                ) : null}
                <Heading fontSize={"xl"}>Invoice Details</Heading>
                <SimpleGrid gap={2} minChildWidth={300}>
                  <FormControl
                    isInvalid={
                      formik.errors.sequence && formik.touched.sequence
                    }
                  >
                    <FormLabel>Proforma Invoice No.</FormLabel>
                    <InputGroup>
                      <PrefixFormField
                        formik={formik}
                        prefixType="proformaInvoice"
                      />
                      <NumberInputInteger
                        min={1}
                        formik={formik}
                        name={"sequence"}
                        onlyInt={true}
                      />
                    </InputGroup>

                    <FormErrorMessage>
                      {formik.errors.sequence}
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
