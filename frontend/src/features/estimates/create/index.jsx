import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { FormikProvider } from "formik";
import useEstimateForm from "../../../hooks/useEstimateForm";
import MainLayout from "../../common/main-layout";
import ItemsList from "./ItemList";
import SelectStatus from "./SelectStatus";
import TotalsBox from "./TotalsBox";
import SelectCustomer from "./SelectCustomer";
export default function CreateEstimatePage() {
  const { formik } = useEstimateForm();
  return (
    <MainLayout>
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <Flex justifyContent={"flex-end"} alignItems={"center"}>
            <Button type="submit" colorScheme="teal" variant="solid">
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
                  name="quoteNo"
                  onChange={formik.handleChange}
                  value={formik.values.quoteNo}
                />
              </FormControl>
              <FormControl
                isRequired
                isInvalid={formik.errors.date && formik.touched.date}
              >
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                />
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
            </FormControl>
          </Grid>
        </form>
      </FormikProvider>
    </MainLayout>
  );
}
