import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input,
  Spinner,
  Textarea
} from "@chakra-ui/react";
import { FormikProvider } from "formik";
import useEstimateForm from "../../../hooks/useEstimateForm";
import MainLayout from "../../common/main-layout";
import ItemsList from "./ItemList";
import SelectCustomer from "./SelectCustomer";
import SelectStatus from "./SelectStatus";
import TotalsBox from "./TotalsBox";
export default function CreateEstimatePage() {
  const { formik, status } = useEstimateForm();
  const loading = status === "loading";
  return (
    <MainLayout>
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
                <FormControl
                  isRequired
                  isInvalid={formik.errors.date && formik.touched.date}
                >
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    name="date"
                    value={formik.values.date}
                    onChange={formik.handleChange}
                  />
                  <FormErrorMessage>{formik.errors.date}</FormErrorMessage>
                </FormControl>
                <SelectStatus formik={formik} />
                <SelectCustomer formik={formik} />
              </Grid>
              <ItemsList formik={formik} />
              <TotalsBox quoteItems={formik.values.items} />
              <FormControl
                isInvalid={
                  formik.errors.description && formik.touched.description
                }
              >
                <FormLabel>Description</FormLabel>
                <Input
                  placeholder="Write any thing to search the quote latere like email id or something to identify the quote."
                  name="description"
                  onChange={formik.handleChange}
                  value={formik.values.description}
                />
                <FormErrorMessage>{formik.errors.description}</FormErrorMessage>
              </FormControl>
              <FormControl
                isInvalid={formik.errors.terms && formik.touched.terms}
              >
                <FormLabel>Terms and conditions</FormLabel>
                <Textarea
                  placeholder="Your terms and conditions for the work."
                  name="terms"
                  onChange={formik.handleChange}
                  value={formik.values.terms}
                />
                <FormErrorMessage>{formik.errors.terms}</FormErrorMessage>
              </FormControl>
            </Grid>
          </form>
        )}
      </FormikProvider>
    </MainLayout>
  );
}
