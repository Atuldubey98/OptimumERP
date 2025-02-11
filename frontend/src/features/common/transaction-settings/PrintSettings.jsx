import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  Heading,
  Skeleton,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import AuthContext from "../../../contexts/AuthContext";
import { Select } from "chakra-react-select";

export default function PrintSettings({ printFormik, formik, loading }) {
  const auth = useContext(AuthContext);
  const currentPlan = auth?.user?.currentPlan
    ? auth?.user?.currentPlan.plan
    : "free";
  const bg = useColorModeValue("gray.100", "gray.700");
  const templateOptions = [
    { value: "simple", label: "Simple template " },
    { value: "borderLand", label: "Border Land template " },
  ];
  return (
    <form onSubmit={printFormik.handleSubmit}>
      <Stack>
        <Box bg={bg} p={3}>
          <Heading fontSize={"lg"}>Print Settings</Heading>
        </Box>
        <Skeleton isLoaded={!loading}>
          <Stack spacing={2}>
            <Flex justifyContent={"flex-start"} alignItems={"center"}>
              <Button
                type="submit"
                isLoading={printFormik.isSubmitting}
                size={"sm"}
                colorScheme="blue"
              >
                Save
              </Button>
            </Flex>
            <FormControl>
              <Select
                options={templateOptions}
                onChange={({ value }) =>
                  printFormik.setFieldValue("defaultTemplate", value)
                }
                value={templateOptions.find(
                  (templateOption) =>
                    templateOption.value ===
                    printFormik?.values?.defaultTemplate
                )}
              />
            </FormControl>
            <Box>
              <Checkbox
                isDisabled={!formik.values.organization}
                name="bank"
                onChange={printFormik.handleChange}
                isChecked={printFormik.values.bank}
              >
                Print Bank Details on Invoice
              </Checkbox>
            </Box>

            <Checkbox
              title={currentPlan === "free" ? "Upgrade your plan" : null}
              isDisabled={!formik.values.organization || currentPlan === "free"}
              name="upiQr"
              onChange={printFormik.handleChange}
              isChecked={printFormik.values.upiQr}
            >
              Print UPI QR on Invoice
            </Checkbox>
          </Stack>
        </Skeleton>
      </Stack>
    </form>
  );
}
