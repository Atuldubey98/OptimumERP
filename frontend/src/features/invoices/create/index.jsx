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
  InputLeftAddon,
  SimpleGrid,
  Spinner,
  Switch,
  Textarea,
} from "@chakra-ui/react";
import { FormikProvider } from "formik";
import { AiOutlineSave } from "react-icons/ai";
import { invoiceStatusList } from "../../../constants/invoice";
import useInvoicesForm from "../../../hooks/useInvoicesForm";
import MainLayout from "../../common/main-layout";
import DateField from "../../estimates/create/DateField";
import DescriptionField from "../../estimates/create/DescriptionField";
import ItemsList from "../../estimates/create/ItemList";
import SelectStatus from "../../estimates/create/SelectStatus";
import TermsAndCondtions from "../../estimates/create/TermsConditions";
import TotalsBox from "../../estimates/create/TotalsBox";
import { defaultInvoiceItem } from "../../estimates/create/data";
import PartySelectBill from "./PartySelectBill";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import NumberInputInteger from "../../common/NumberInputInteger";
import useSaveAndNewForm from "../../../hooks/useSaveAndNewForm";
import useLimitsInFreePlan from "../../../hooks/useLimitsInFreePlan";
export default function CreateInvoicePage() {
  const { saveAndNew, onToggleSaveAndNew } =
    useSaveAndNewForm("save-new:invoice");
  const { formik, status } = useInvoicesForm({
    saveAndNew,
  });
  const loading = status === "loading";
  const { transactionPrefix } = useCurrentOrgCurrency();
  const { disable } = useLimitsInFreePlan({
    key: "invoices",
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
                {formik.values._id ? null : (
                  <FormControl
                    display="flex"
                    justifyContent={"flex-end"}
                    alignItems="center"
                  >
                    <FormLabel htmlFor="save-and-new" mb="0">
                      Save & New
                    </FormLabel>
                    <Switch
                      onChange={(e) => {
                        onToggleSaveAndNew(e.currentTarget.checked);
                      }}
                      isChecked={saveAndNew}
                      id="save-and-new"
                    />
                  </FormControl>
                )}
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
                    isRequired
                    isInvalid={
                      formik.errors.invoiceNo && formik.touched.invoiceNo
                    }
                  >
                    <FormLabel>Invoice No.</FormLabel>
                    <InputGroup>
                      {transactionPrefix.invoice ? (
                        <InputLeftAddon>
                          {transactionPrefix.invoice}
                        </InputLeftAddon>
                      ) : null}
                      <NumberInputInteger
                        min={1}
                        formik={formik}
                        name={"invoiceNo"}
                        onlyInt={true}
                      />
                    </InputGroup>

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
