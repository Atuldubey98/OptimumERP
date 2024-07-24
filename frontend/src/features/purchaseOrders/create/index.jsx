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
import { AiOutlineSave } from "react-icons/ai";
import { invoiceStatusList } from "../../../constants/invoice";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import useLimitsInFreePlan from "../../../hooks/useLimitsInFreePlan";
import useSaveAndNewForm from "../../../hooks/useSaveAndNewForm";
import NumberInputInteger from "../../common/NumberInputInteger";
import MainLayout from "../../common/main-layout";
import DescriptionField from "../../estimates/create/DescriptionField";
import ItemsList from "../../estimates/create/ItemList";
import SelectStatus from "../../estimates/create/SelectStatus";
import TermsAndCondtions from "../../estimates/create/TermsConditions";
import TotalsBox from "../../estimates/create/TotalsBox";
import { defaultInvoiceItem } from "../../estimates/create/data";
import PartySelectBill from "../../invoices/create/PartySelectBill";
import usePurchaseOrderForm from "../../../hooks/usePurchaseOrderForm";
import { FormikProvider } from "formik";
import PrefixFormField from "../../common/PrefixFormField";
import useTaxes from "../../../hooks/useTaxes";
import useUms from "../../../hooks/useUms";
export default function PurchaseOrderEditPage() {
  const { saveAndNew, onToggleSaveAndNew } = useSaveAndNewForm(
    "save-new:purchaseOrders"
  );
  const { formik, status } = usePurchaseOrderForm({
    saveAndNew,
  });
  const { taxes } = useTaxes();
  const { ums } = useUms();
  const loading = status === "loading";
  const { disable } = useLimitsInFreePlan({
    key: "purchaseOrders",
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
                    isInvalid={formik.errors.poNo && formik.touched.poNo}
                  >
                    <FormLabel>PO No.</FormLabel>
                    <InputGroup>
                      <PrefixFormField
                        formik={formik}
                        prefixType={"purchaseOrder"}
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
                  <SelectStatus
                    formik={formik}
                    statusList={invoiceStatusList}
                  />
                  <FormControl>
                    <FormLabel>PO Date</FormLabel>
                    <Input
                      value={formik.values.date}
                      onChange={formik.handleChange}
                      name="poDate"
                      type="date"
                    />
                  </FormControl>
                </SimpleGrid>
                <Heading fontSize={"xl"}>Items</Heading>
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
