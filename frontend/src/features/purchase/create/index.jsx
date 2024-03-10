import { FormikProvider } from "formik";
import usePurchaseForm from "../../../hooks/usePurchaseForm";
import MainLayout from "../../common/main-layout";
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
} from "@chakra-ui/react";
import SelectStatus from "../../estimates/create/SelectStatus";
import DateField from "../../estimates/create/DateField";
import ItemsList from "../../estimates/create/ItemList";
import TotalsBox from "../../estimates/create/TotalsBox";
import DescriptionField from "../../estimates/create/DescriptionField";
import { defaultInvoiceItem } from "../../estimates/create/data";
import SelectCustomer from "../../estimates/create/SelectCustomer";
import TermsAndCondtions from "../../estimates/create/TermsConditions";
import { purchaseStatusList } from "../../../constants/purchase";
import { AiOutlineSave } from "react-icons/ai";

export default function CreatePurchasePage() {
  const { formik, status } = usePurchaseForm();
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
                <Heading fontSize={"xl"}>Purchase Details</Heading>
                <SimpleGrid gap={2} minChildWidth={300}>
                  <FormControl
                    isRequired
                    isInvalid={formik.errors.quoteNo && formik.touched.quoteNo}
                  >
                    <FormLabel>Purchase No.</FormLabel>
                    <Input
                      type="text"
                      name="purchaseNo"
                      onChange={formik.handleChange}
                      value={formik.values.purchaseNo}
                    />
                    <FormErrorMessage>
                      {formik.errors.invoiceNo}
                    </FormErrorMessage>
                  </FormControl>
                  <DateField formik={formik} />
                  <SelectStatus
                    formik={formik}
                    statusList={purchaseStatusList}
                  />
                  <SelectCustomer formik={formik} />
                </SimpleGrid>
                <Heading fontSize={"xl"}>Items</Heading>
                <ItemsList formik={formik} defaultItem={defaultInvoiceItem} />
                <TotalsBox quoteItems={formik.values.items} />
                <DescriptionField formik={formik} />
              </Grid>
            </form>
          )}
        </FormikProvider>
      </Box>
    </MainLayout>
  );
}
