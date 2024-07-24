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
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import useEstimateForm from "../../../hooks/useEstimateForm";
import useLimitsInFreePlan from "../../../hooks/useLimitsInFreePlan";
import MainLayout from "../../common/main-layout";
import PartySelectBill from "../../invoices/create/PartySelectBill";
import DateField from "./DateField";
import DescriptionField from "./DescriptionField";
import ItemsList from "./ItemList";
import SelectStatus from "./SelectStatus";
import TermsAndCondtions from "./TermsConditions";
import TotalsBox from "./TotalsBox";
import { defaultQuoteItem, statusList } from "./data";
import PrefixFormField from "../../common/PrefixFormField";
import useTaxes from "../../../hooks/useTaxes";
import useUms from "../../../hooks/useUms";
export default function CreateEstimatePage() {
  const { formik, status } = useEstimateForm();
  const { taxes } = useTaxes();
  const { ums } = useUms();
  const loading = status === "loading";
  const { disable } = useLimitsInFreePlan({
    key: "quotes",
  });
  const { receiptDefaults } = useCurrentOrgCurrency();
  return (
    <MainLayout>
      <Box p={5}>
        <FormikProvider value={formik}>
          {loading ? (
            <Flex justifyContent={"center"} alignItems={"center"}>
              <Spinner />
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
                <FormControl isRequired>
                  <FormLabel>Bill To</FormLabel>
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
                <Heading fontSize={"xl"}>Estimate Details</Heading>
                <SimpleGrid gap={2} minChildWidth={300}>
                  <FormControl
                    isInvalid={
                      formik.errors.sequence && formik.touched.sequence
                    }
                  >
                    <FormLabel>Quotation No.</FormLabel>
                    <InputGroup>
                      <PrefixFormField formik={formik} prefixType="quotation" />
                      <Input
                        type="number"
                        name="sequence"
                        onChange={formik.handleChange}
                        value={formik.values.sequence}
                      />
                    </InputGroup>
                    <FormErrorMessage>
                      {formik.errors.sequence}
                    </FormErrorMessage>
                  </FormControl>
                  <DateField formik={formik} />
                  <SelectStatus formik={formik} statusList={statusList} />
                </SimpleGrid>
                <Heading fontSize={"xl"}>Items</Heading>
                <ItemsList
                  formik={formik}
                  ums={ums}
                  defaultItem={{
                    ...defaultQuoteItem,
                    tax: receiptDefaults?.tax,
                    um: receiptDefaults?.um,
                  }}
                  taxes={taxes}
                />
                <TotalsBox quoteItems={formik.values.items} taxes={taxes} />
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
