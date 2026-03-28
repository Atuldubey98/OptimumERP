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
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { invoiceStatusList } from "../../../constants/invoice";
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
  const { t } = useTranslation("common");

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
                  <FormLabel>{t("common_ui.receipt.invoice_number")}</FormLabel>
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
                  <FormLabel>{t("common_ui.receipt.po_number")}</FormLabel>
                  <Input
                    value={formik.values.poNo}
                    onChange={formik.handleChange}
                    name="poNo"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>{t("common_ui.receipt.po_date")}</FormLabel>
                  <Input
                    value={formik.values.poDate}
                    onChange={formik.handleChange}
                    name="poDate"
                    type="date"
                  />
                </FormControl>
                <SelectStatus
                  formik={formik}
                  statusList={invoiceStatusList}
                />
              </SimpleGrid>
              <Divider />
              <DescriptionField formik={formik} />
              <FieldArray
                name="items"
                render={(itemsHelper) => (
                  <Box>
                    <Box p={2} bg={bg}>
                      <Text>{t("common_ui.receipt.items_list")}</Text>
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
                        {t("common_ui.receipt.add_line_item")}
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
