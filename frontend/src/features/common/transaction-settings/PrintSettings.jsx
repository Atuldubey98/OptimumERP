import {
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Skeleton,
  Stack,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { IoIosHelpCircleOutline } from "react-icons/io";
import AuthContext from "../../../contexts/AuthContext";
function PrintPopOverInstructions() {
  return (
    <Popover>
      <PopoverTrigger>
        <IconButton size={"sm"} icon={<IoIosHelpCircleOutline />} />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Print Settings</PopoverHeader>
        <PopoverBody>
          Here you can define print settings for your UPI QR Code and bank
          details
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
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
            <Tooltip
              label={currentPlan === "free" ? "Upgrade your plan" : null}
              aria-label="qr code tool tip"
            >
              <Checkbox
                isDisabled={
                  !formik.values.organization || currentPlan === "free"
                }
                name="upiQr"
                onChange={printFormik.handleChange}
                isChecked={printFormik.values.upiQr}
              >
                Print UPI QR on Invoice
              </Checkbox>
            </Tooltip>
          </Stack>
        </Skeleton>
      </Stack>
    </form>
  );
}
