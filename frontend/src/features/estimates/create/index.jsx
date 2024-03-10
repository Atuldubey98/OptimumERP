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
import { FormikProvider } from "formik";
import useEstimateForm from "../../../hooks/useEstimateForm";
import MainLayout from "../../common/main-layout";
import DateField from "./DateField";
import DescriptionField from "./DescriptionField";
import ItemsList from "./ItemList";
import SelectCustomer from "./SelectCustomer";
import SelectStatus from "./SelectStatus";
import TermsAndCondtions from "./TermsConditions";
import TotalsBox from "./TotalsBox";
import { defaultQuoteItem, statusList } from "./data";
import { AiOutlineSave } from "react-icons/ai";
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
                  leftIcon={<AiOutlineSave />}
                  isLoading={formik.isSubmitting || loading}
                  type="submit"
                  colorScheme="teal"
                  variant="solid"
                >
                  Save
                </Button>
              </Flex>
              <Heading fontSize={"xl"}>Estimate Details</Heading>
              <Grid gap={4}>
                <SimpleGrid gap={2} minChildWidth={300}>
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
                </SimpleGrid>
                <Heading fontSize={"xl"}>Items</Heading>
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
