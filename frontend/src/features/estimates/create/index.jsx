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
import { useDeferredValue } from "react";
import { useTranslation } from "react-i18next";
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
import BannerWithLabel from "../../common/BannerWithLabel";
import { FaFileInvoice } from "react-icons/fa6";
export default function CreateEstimatePage() {
  const { t } = useTranslation("quote");
  const { formik, status } = useEstimateForm();
  const deferredItems = useDeferredValue(formik.values.items);
  const { taxes } = useTaxes();
  const { ums } = useUms();
  const loading = status === "loading";
  const { disable } = useLimitsInFreePlan({
    key: "quotes",
  });
  const { receiptDefaults } = useCurrentOrgCurrency();
  const hasError = status === "error";
  return (
    <MainLayout>
      <Box p={5}>
        <FormikProvider value={formik}>
          {loading ? (
            <Flex justifyContent={"center"} alignItems={"center"}>
              <Spinner />
            </Flex>
          ) : hasError ? (
            <BannerWithLabel label={t("quote_ui.banner.quotation_not_found")} Icon={FaFileInvoice} />
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
                  {t("quote_ui.actions.save")}
                </Button>
              </Flex>
              <Grid gap={4}>
                <Heading fontSize={"xl"}>{t("quote_ui.form.party_section")}</Heading>
                <FormControl isRequired>
                  <FormLabel>{t("quote_ui.form.bill_to")}</FormLabel>
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
                    <FormLabel>{t("quote_ui.form.billing_address")}</FormLabel>
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
                <Heading fontSize={"xl"}>{t("quote_ui.form.estimate_details")}</Heading>
                <SimpleGrid gap={2} minChildWidth={300}>
                  <FormControl
                    isInvalid={
                      formik.errors.sequence && formik.touched.sequence
                    }
                  >
                    <FormLabel>{t("quote_ui.form.quotation_no")}</FormLabel>
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
                <Heading fontSize={"xl"}>{t("quote_ui.form.items_section")}</Heading>
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
                <TotalsBox quoteItems={deferredItems} taxes={taxes} />
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
