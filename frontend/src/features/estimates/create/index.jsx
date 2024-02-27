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
  Textarea,
} from "@chakra-ui/react";
import { FormikProvider } from "formik";
import useEstimateForm from "../../../hooks/useEstimateForm";
import MainLayout from "../../common/main-layout";
import ItemsList from "./ItemList";
import SelectCustomer from "./SelectCustomer";
import SelectStatus from "./SelectStatus";
import TotalsBox from "./TotalsBox";
import TermsAndCondtions from "./TermsConditions";
import DescriptionField from "./DescriptionField";
import DateField from "./DateField";
import { defaultQuoteItem, statusList } from "./data";
export default function CreateEstimatePage() {
  const { formik, status } = useEstimateForm();
  const loading = status === "loading";
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
                    <FormLabel>Quotation No.</FormLabel>
                    <Input
                      type="number"
                      name="quoteNo"
                      onChange={formik.handleChange}
                      value={formik.values.quoteNo}
                    />
                    <FormErrorMessage>{formik.errors.quoteNo}</FormErrorMessage>
                  </FormControl>
                  <DateField formik={formik} />
                  <SelectStatus formik={formik} statusList={statusList} />
                  <SelectCustomer formik={formik} />
                </Grid>
                <ItemsList formik={formik} defaultItem={defaultQuoteItem} />
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
