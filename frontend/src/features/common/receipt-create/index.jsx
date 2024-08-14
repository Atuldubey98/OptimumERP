import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FieldArray, FormikProvider } from "formik";
import React from "react";
import { useParams } from "react-router-dom";
import receiptMetas from "../../../constants/receiptMetas";
import useReceiptForm from "../../../hooks/useReceiptForm";
import MainLayout from "../main-layout";
import NumberInputInteger from "../NumberInputInteger";
import PrefixFormField from "../PrefixFormField";
import DateField from "./DateField";
import DescriptionField from "./DescriptionField";
import ReceiptItemsList from "./ReceiptItemsList";
import ReceiptPartySelect from "./ReceiptPartySelect";
import SelectStatus from "./SelectStatus";

export default function ReceiptEditPage() {

  const { type } = useParams();
  const { formik, status } = useReceiptForm();
  const currentReceiptMeta = receiptMetas[type];
  const bg = useColorModeValue("gray.50", "gray.700");
  return (
    <MainLayout>
      {status === "loading" ? (
        <Flex marginBlock={4} justifyContent={"center"} alignItems={"center"}>
          <Spinner />
        </Flex>
      ) : (
        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={2} p={4} bg={bg}>
              <ReceiptPartySelect
                formik={formik}
                partyNameLabel={currentReceiptMeta.partyNameLabel}
              />
            </Stack>
            <Stack spacing={3} p={4}>
              <SimpleGrid gap={3} minChildWidth={350}>
                <FormControl
                  isInvalid={formik.errors.sequence && formik.touched.sequence}
                >
                  <FormLabel>Invoice #</FormLabel>
                  <InputGroup>
                    <PrefixFormField formik={formik} prefixType={"invoice"} />
                    <NumberInputInteger
                      min={1}
                      formik={formik}
                      name={"sequence"}
                      onlyInt={true}
                    />
                  </InputGroup>
                  <FormErrorMessage>{formik.errors.sequence}</FormErrorMessage>
                </FormControl>
                <DateField formik={formik} />
                <FormControl>
                  <FormLabel>PO Number</FormLabel>
                  <Input
                    value={formik.values.poNo}
                    onChange={formik.handleChange}
                    name="poNo"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>PO Date</FormLabel>
                  <Input
                    value={formik.values.poDate}
                    onChange={formik.handleChange}
                    name="poDate"
                    type="date"
                  />
                </FormControl>
                <SelectStatus
                  formik={formik}
                  statusList={[
                    {
                      type: "draft",
                      label: "Draft",
                      colorScheme: "blue",
                    },
                    {
                      type: "sent",
                      label: "Sent",
                      colorScheme: "teal",
                    },
                    {
                      type: "pending",
                      label: "Pending",
                      colorScheme: "yellow",
                    },
                  ]}
                />
              </SimpleGrid>
              <Divider />
              <DescriptionField formik={formik} />
              <FieldArray
                name="items"
                render={(itemsHelper) => (
                  <Box>
                    <Box p={2} bg={bg}>
                      <Text>Items List</Text>
                    </Box>
                    <Stack spacing={2} marginBlock={2}>
                      <ReceiptItemsList
                        formik={formik}
                        itemsHelper={itemsHelper}
                      />
                    </Stack>
                    <Box marginBlock={6}>
                      <Button
                        onClick={() =>
                          itemsHelper.push({
                            product: undefined,
                            quantity: 0,
                            tax: undefined,
                            price: 0,
                            total: 0,
                          })
                        }
                        width={"100%"}
                      >
                        Add Line item
                      </Button>
                    </Box>
                  </Box>
                )}
              />
            </Stack>
          </form>
        </FormikProvider>
      )}
    </MainLayout>
  );
}
