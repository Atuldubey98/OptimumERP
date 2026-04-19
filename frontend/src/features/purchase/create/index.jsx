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
  Switch,
  Textarea,
} from "@chakra-ui/react";
import { FormikProvider } from "formik";
import { useDeferredValue } from "react";
import { AiOutlineSave } from "react-icons/ai";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { purchaseStatusList } from "../../../constants/purchase";
import useLimitsInFreePlan from "../../../hooks/useLimitsInFreePlan";
import usePurchaseForm from "../../../hooks/usePurchaseForm";
import useSaveAndNewForm from "../../../hooks/useSaveAndNewForm";
import useTaxes from "../../../hooks/useTaxes";
import useUms from "../../../hooks/useUms";
import BannerWithLabel from "../../common/BannerWithLabel";
import MainLayout from "../../common/main-layout";
import DateField from "../../estimates/create/DateField";
import DescriptionField from "../../estimates/create/DescriptionField";
import ItemsList from "../../estimates/create/ItemList";
import SelectStatus from "../../estimates/create/SelectStatus";
import TotalsBox from "../../estimates/create/TotalsBox";
import { defaultInvoiceItem } from "../../estimates/create/data";
import PartySelectBill from "../../invoices/create/PartySelectBill";
import { useTranslation } from "react-i18next";
export default function CreatePurchasePage() {
  const { t } = useTranslation("purchase");
  const { saveAndNew, onToggleSaveAndNew } =
    useSaveAndNewForm("save-new:purchase");
  const { taxes } = useTaxes();
  const { ums } = useUms();
  const { formik, status } = usePurchaseForm({
    saveAndNew,
  });
  const deferredItems = useDeferredValue(formik.values.items);
  const loading = status === "loading";
  const { disable } = useLimitsInFreePlan({
    key: "purchases",
  });
  const hasError = status === "error";
  return (
    
      <Box p={5}>
        <FormikProvider value={formik}>
          {loading ? (
            <Flex justifyContent={"center"} alignItems={"center"}>
              <Spinner size={"md"} />
            </Flex>
          ) : hasError ? (
            <BannerWithLabel
              label={t("purchase_ui.form.not_found")}
              Icon={FaMoneyBillTrendUp}
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
                      {t("purchase_ui.form.save_new")}
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
                  {t("purchase_ui.form.save")}
                </Button>
              </Flex>
              <Grid gap={4}>
                <Heading fontSize={"xl"}>{t("purchase_ui.form.party_section")}</Heading>
                <FormControl isRequired>
                  <FormLabel>{t("purchase_ui.form.bill_from")}</FormLabel>
                  <PartySelectBill formik={formik} />
                  <FormErrorMessage>{formik.errors.party}</FormErrorMessage>
                </FormControl>
                {formik.values.party ? (
                  <FormControl isRequired>
                    <FormLabel>{t("purchase_ui.form.billing_address")}</FormLabel>
                    <Textarea
                      name="billingAddress"
                      onChange={formik.handleChange}
                      value={formik.values.billingAddress}
                    />
                  </FormControl>
                ) : null}
                <Heading fontSize={"xl"}>{t("purchase_ui.form.purchase_details")}</Heading>
                <SimpleGrid gap={2} minChildWidth={300}>
                  <FormControl
                    isInvalid={formik.errors.num && formik.touched.num}
                  >
                    <FormLabel>{t("purchase_ui.form.purchase_no")}</FormLabel>
                    <Input
                      type="text"
                      name="num"
                      onChange={formik.handleChange}
                      value={formik.values.num}
                    />
                    <FormErrorMessage>{formik.errors.num}</FormErrorMessage>
                  </FormControl>
                  <DateField formik={formik} />
                  <SelectStatus
                    formik={formik}
                    statusList={purchaseStatusList}
                    namespace="purchase"
                  />
                </SimpleGrid>
                <Heading fontSize={"xl"}>{t("purchase_ui.form.items_section")}</Heading>

                <ItemsList
                  formik={formik}
                  defaultItem={defaultInvoiceItem}
                  taxes={taxes}
                  ums={ums}
                />
                {formik.values._id ? null : (
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="autoItems" mb="0">
                      {t("purchase_ui.form.auto_create_items")}
                    </FormLabel>
                    <Switch
                      id="autoItems"
                      name="autoItems"
                      isChecked={formik.values.autoItems}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "autoItems",
                          e.currentTarget.checked
                        )
                      }
                    />
                  </FormControl>
                )}
                <TotalsBox
                  quoteItems={deferredItems}
                  taxes={taxes}
                  shippingCharges={formik.values.shippingCharges || 0}
                  onShippingChargesChange={(value) => {
                    formik.setFieldValue("shippingCharges", value);
                  }}
                />
                <DescriptionField formik={formik} />
              </Grid>
            </form>
          )}
        </FormikProvider>
      </Box>
    
  );
}
