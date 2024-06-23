import {
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  Skeleton,
  Stack,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import AuthContext from "../../../contexts/AuthContext";

export default function PrintSettings({ printFormik, formik, loading }) {
  const auth = useContext(AuthContext);
  const currentPlan = auth?.user?.currentPlan
    ? auth?.user?.currentPlan.plan
    : "free";
  const bg = useColorModeValue("gray.100", "gray.700");

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
