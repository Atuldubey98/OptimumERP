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
import useUms from "../../../hooks/useUms";
import useTaxes from "../../../hooks/useTaxes";
import useLimitsInFreePlan from "../../../hooks/useLimitsInFreePlan";
import PrefixFormField from "../../common/PrefixFormField";
import BannerWithLabel from "../../common/BannerWithLabel";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { useTranslation } from "react-i18next";

export default function ProformaInvoiceFormPage() {
  const { t } = useTranslation("proformaInvoice");
  const { formik, status } = useProformaInvoicesForm();
  const { taxes } = useTaxes();
  const { ums } = useUms();
  const loading = status === "loading";
  const { disable } = useLimitsInFreePlan({
    key: "proformaInvoices",
  });
  const error = status === "error";
  return (
    <MainLayout>
      <Box p={5}>
        <FormikProvider value={formik}>
          {loading ? (
            <Flex justifyContent={"center"} alignItems={"center"}>
              <Spinner size={"md"} />
            </Flex>
          ) : error ? (
            <BannerWithLabel
              Icon={LiaFileInvoiceDollarSolid}
              label={t("proforma_invoice_ui.form.not_found")}
            />
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
                  {t("proforma_invoice_ui.form.save_button")}
                </Button>
              </Flex>
              <Grid gap={4}>
                <Heading fontSize={"xl"}>{t("proforma_invoice_ui.form.party_section")}</Heading>
                <FormControl
                  isInvalid={formik.errors.party && formik.touched.party}
                  isRequired
                >
                  <FormLabel>{t("proforma_invoice_ui.form.bill_to_label")}</FormLabel>
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
                    <FormLabel>{t("proforma_invoice_ui.form.billing_address_label")}</FormLabel>
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
                <Heading fontSize={"xl"}>{t("proforma_invoice_ui.form.invoice_details_section")}</Heading>
                <SimpleGrid gap={2} minChildWidth={300}>
                  <FormControl
                    isInvalid={
                      formik.errors.sequence && formik.touched.sequence
                    }
                  >
                    <FormLabel>{t("proforma_invoice_ui.form.sequence_label")}</FormLabel>
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
                    namespace="invoice"
                  />
                  <FormControl>
                    <FormLabel>{t("proforma_invoice_ui.form.po_number_label")}</FormLabel>
                    <Input
                      value={formik.values.poNo}
                      onChange={formik.handleChange}
                      name="poNo"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>{t("proforma_invoice_ui.form.po_date_label")}</FormLabel>
                    <Input
                      value={formik.values.poDate}
                      onChange={formik.handleChange}
                      name="poDate"
                      type="date"
                    />
                  </FormControl>
                </SimpleGrid>
                <Heading fontSize={"xl"}>{t("proforma_invoice_ui.form.items_section")}</Heading>
                <ItemsList
                  formik={formik}
                  defaultItem={defaultInvoiceItem}
                  taxes={taxes}
                  ums={ums}
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
