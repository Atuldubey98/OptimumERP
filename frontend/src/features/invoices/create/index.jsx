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
  Switch,
  Textarea,
} from "@chakra-ui/react";
import { FormikProvider } from "formik";
import { useDeferredValue } from "react";
import { useTranslation } from "react-i18next";
import { AiOutlineSave } from "react-icons/ai";
import { invoiceStatusList } from "../../../constants/invoice";
import useInvoicesForm from "../../../hooks/useInvoicesForm";
import useLimitsInFreePlan from "../../../hooks/useLimitsInFreePlan";
import useSaveAndNewForm from "../../../hooks/useSaveAndNewForm";
import NumberInputInteger from "../../common/NumberInputInteger";
import PrefixFormField from "../../common/PrefixFormField";
import MainLayout from "../../common/main-layout";
import DateField from "../../estimates/create/DateField";
import DescriptionField from "../../estimates/create/DescriptionField";
import ItemsList from "../../estimates/create/ItemList";
import SelectStatus from "../../estimates/create/SelectStatus";
import TermsAndCondtions from "../../estimates/create/TermsConditions";
import TotalsBox from "../../estimates/create/TotalsBox";
import PartySelectBill from "./PartySelectBill";
import useTaxes from "../../../hooks/useTaxes";
import useUms from "../../../hooks/useUms";
import BannerWithLabel from "../../common/BannerWithLabel";
import { FaFileInvoiceDollar } from "react-icons/fa6";
export default function CreateInvoicePage() {
  const { t } = useTranslation("invoice");
  const { saveAndNew, onToggleSaveAndNew } =
    useSaveAndNewForm("save-new:invoice");
  const { taxes } = useTaxes();
  const { ums } = useUms();
  const { formik, status } = useInvoicesForm({
    saveAndNew,
  });
  const deferredItems = useDeferredValue(formik.values.items);
  const loading = status === "loading";
  const { disable } = useLimitsInFreePlan({
    key: "invoices",
  });
  const hasError = status === "error";
  return (
    <MainLayout>
      <Box p={5}>
        <FormikProvider value={formik}>
          {loading ? (
            <Flex justifyContent={"center"} alignItems={"center"}>
              <Spinner size={"md"} />
            </Flex>
          ) : hasError ? (
            <BannerWithLabel
              label={t("invoice_ui.page.not_found")}
              Icon={FaFileInvoiceDollar}
            />
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
                      {t("invoice_ui.form.save_and_new_label")}
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
                  {t("invoice_ui.form.save_button")}
                </Button>
              </Flex>
              <Grid gap={4}>
                <Heading fontSize={"xl"}>{t("invoice_ui.form.party_section")}</Heading>
                <FormControl
                  isInvalid={formik.errors.party && formik.touched.party}
                  isRequired
                >
                  <FormLabel>{t("invoice_ui.form.bill_to")}</FormLabel>
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
                    <FormLabel>{t("invoice_ui.form.billing_address")}</FormLabel>
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
                <Heading fontSize={"xl"}>{t("invoice_ui.form.invoice_details_section")}</Heading>
                <SimpleGrid gap={2} minChildWidth={300}>
                  <FormControl
                    isInvalid={
                      formik.errors.sequence && formik.touched.sequence
                    }
                  >
                    <FormLabel>{t("invoice_ui.form.invoice_no")}</FormLabel>
                    <InputGroup>
                      <PrefixFormField formik={formik} prefixType={"invoice"} />
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
                    <FormLabel>{t("invoice_ui.form.po_number")}</FormLabel>
                    <Input
                      value={formik.values.poNo}
                      onChange={formik.handleChange}
                      name="poNo"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>{t("invoice_ui.form.po_date")}</FormLabel>
                    <Input
                      value={formik.values.poDate}
                      onChange={formik.handleChange}
                      name="poDate"
                      type="date"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>{t("invoice_ui.form.due_date")}</FormLabel>
                    <Input
                      min={formik.values.date}
                      value={formik.values.dueDate}
                      onChange={formik.handleChange}
                      name="dueDate"
                      type="date"
                    />
                  </FormControl>
                </SimpleGrid>
                <Heading fontSize={"xl"}>{t("invoice_ui.form.items_section")}</Heading>
                <ItemsList
                  formik={formik}
                  taxes={taxes}
                  ums={ums}
                  namespace="invoice"
                />
                <TotalsBox
                  quoteItems={deferredItems}
                  taxes={taxes}
                  shippingCharges={formik.values.shippingCharges || 0}
                  onShippingChargesChange={(value) => {
                    formik.setFieldValue("shippingCharges", value);
                  }}
                />
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
