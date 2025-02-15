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
  Switch,
  Textarea,
} from "@chakra-ui/react";
import { FormikProvider } from "formik";
import { AiOutlineSave } from "react-icons/ai";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { purchaseStatusList } from "../../../constants/purchase";
import useLimitsInFreePlan from "../../../hooks/useLimitsInFreePlan";
import usePurchaseForm from "../../../hooks/usePurchaseForm";
import useSaveAndNewForm from "../../../hooks/useSaveAndNewForm";
import useTaxes from "../../../hooks/useTaxes";
import useUms from "../../../hooks/useUms";
import BannerWithLabel from "../../common/BannerWithLabel";
import MainLayout from "../../common/main-layout";
import DateField from "../../estimates/create/DateField";
import DescriptionField from "../../estimates/create/DescriptionField";
import ItemsList from "../../estimates/create/ItemList";
import SelectStatus from "../../estimates/create/SelectStatus";
import TotalsBox from "../../estimates/create/TotalsBox";
import { defaultInvoiceItem } from "../../estimates/create/data";
import PartySelectBill from "../../invoices/create/PartySelectBill";
export default function CreatePurchasePage() {
  const { saveAndNew, onToggleSaveAndNew } =
    useSaveAndNewForm("save-new:purchase");
  const { taxes } = useTaxes();
  const { ums } = useUms();
  const { formik, status } = usePurchaseForm({
    saveAndNew,
  });
  const loading = status === "loading";
  const { disable } = useLimitsInFreePlan({
    key: "purchases",
  });
  const hasError = status === "error";
  return (
    <MainLayout>
      <Box p={5}>
        <FormikProvider value={formik}>
          {loading ? (
            <Flex justifyContent={"center"} alignItems={"center"}>
              <Spinner size={"md"} />
            </Flex>
          ) : hasError ? (
            <BannerWithLabel
              label={"Purchase invoice not found"}
              Icon={FaMoneyBillTrendUp}
            />
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
                <FormControl isRequired>
                  <FormLabel>Bill from</FormLabel>
                  <PartySelectBill formik={formik} />
                  <FormErrorMessage>{formik.errors.party}</FormErrorMessage>
                </FormControl>
                {formik.values.party ? (
                  <FormControl isRequired>
                    <FormLabel>Billing Address</FormLabel>
                    <Textarea
                      name="billingAddress"
                      onChange={formik.handleChange}
                      value={formik.values.billingAddress}
                    />
                  </FormControl>
                ) : null}
                <Heading fontSize={"xl"}>Purchase Details</Heading>
                <SimpleGrid gap={2} minChildWidth={300}>
                  <FormControl
                    isInvalid={formik.errors.num && formik.touched.num}
                  >
                    <FormLabel>Purchase No.</FormLabel>
                    <Input
                      type="text"
                      name="num"
                      onChange={formik.handleChange}
                      value={formik.values.num}
                    />
                    <FormErrorMessage>{formik.errors.num}</FormErrorMessage>
                  </FormControl>
                  <DateField formik={formik} />
                  <SelectStatus
                    formik={formik}
                    statusList={purchaseStatusList}
                  />
                </SimpleGrid>
                <Heading fontSize={"xl"}>Items</Heading>

                <ItemsList
                  formik={formik}
                  defaultItem={defaultInvoiceItem}
                  taxes={taxes}
                  ums={ums}
                />
                {formik.values._id ? null : (
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="autoItems" mb="0">
                      Auto create items
                    </FormLabel>
                    <Switch
                      id="autoItems"
                      name="autoItems"
                      isChecked={formik.values.autoItems}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "autoItems",
                          e.currentTarget.checked
                        )
                      }
                    />
                  </FormControl>
                )}
                <TotalsBox quoteItems={formik.values.items} taxes={taxes} />
                <DescriptionField formik={formik} />
              </Grid>
            </form>
          )}
        </FormikProvider>
      </Box>
    </MainLayout>
  );
}
