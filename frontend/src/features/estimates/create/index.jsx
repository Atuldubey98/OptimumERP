import {
    Button,
    FormControl,
    FormLabel,
    Grid,
    Input,
    Select,
    Stack
} from "@chakra-ui/react";
import { MdAdd } from "react-icons/md";
import MainLayout from "../../common/main-layout";
import QuoteItem from "./QuoteItem";
import SelectCustomer from "./SelectCustomer";
export default function CreateEstimatePage() {
  return (
    <MainLayout>
      <form>
        <Grid>
          <Grid gap={2} gridTemplateColumns={"1fr 1fr 1fr"}>
            <SelectCustomer />
            <FormControl>
              <FormLabel>Quotation No.</FormLabel>
              <Input />
            </FormControl>
            <FormControl>
              <FormLabel>Date</FormLabel>
              <Input type="date" />
            </FormControl>
            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select>
                <option>Draft</option>
                <option>Pending</option>
                <option>Sent</option>
                <option>Accepted</option>
                <option>Declined</option>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Stack spacing={2} marginBlock={8}>
          <QuoteItem />
        </Stack>
        <Button
          width={"100%"}
          leftIcon={<MdAdd />}
          colorScheme="blue"
          variant="outline"
        >
          Add Field
        </Button>
      </form>
    </MainLayout>
  );
}
