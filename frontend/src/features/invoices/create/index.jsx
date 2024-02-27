import { FormikProvider } from "formik";
import useInvoicesForm from "../../../hooks/useInvoicesForm";
import MainLayout from "../../common/main-layout";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input,
  Spinner,
} from "@chakra-ui/react";
import SelectStatus from "../../estimates/create/SelectStatus";
import DateField from "../../estimates/create/DateField";
import ItemsList from "../../estimates/create/ItemList";
import TotalsBox from "../../estimates/create/TotalsBox";
import DescriptionField from "../../estimates/create/DescriptionField";
import { defaultInvoiceItem } from "../../estimates/create/data";
import SelectCustomer from "../../estimates/create/SelectCustomer";
import TermsAndCondtions from "../../estimates/create/TermsConditions";
import { invoiceStatusList } from "../../../constants/invoice";

export default function CreateInvoicePage() {
  const { formik, status } = useInvoicesForm();
  const loading = status === "loading";
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
                  isLoading={formik.isSubmitting || loading}
                  isDisabled={!formik.isValid}
                  type="submit"
                  colorScheme="teal"
                  variant="solid"
                >
                  Save
                </Button>
              </Flex>
              <Grid gap={4}>
                <Grid gap={2} gridTemplateColumns={"1fr 1fr 1fr"}>
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
                  <SelectCustomer formik={formik} />
                </Grid>
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
