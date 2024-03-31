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
} from "@chakra-ui/react";
import React from "react";
import { IoIosHelpCircleOutline } from "react-icons/io";
function PrintPopOverInstructions() {
  return (
    <Popover>
      <PopoverTrigger>
        <IconButton size={"xs"} icon={<IoIosHelpCircleOutline />} />
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
  return (
    <form onSubmit={printFormik.handleSubmit}>
      <Stack spacing={6}>
        <Flex justifyContent={"space-between"} alignItems={"center"}>
          <Heading fontSize={"lg"}>Print Settings</Heading>
          <PrintPopOverInstructions />
        </Flex>
        <Skeleton isLoaded={!loading}>
          <Stack spacing={3}>
            <Box>
              <Checkbox
                isDisabled={!formik.values.organization}
                name="bank"
                onChange={printFormik.handleChange}
                isChecked={printFormik.values.bank}
              >
                Print Bank Details
              </Checkbox>
            </Box>
            <Box>
              <Checkbox
                isDisabled={!formik.values.organization}
                name="upiQr"
                onChange={printFormik.handleChange}
                isChecked={printFormik.values.upiQr}
              >
                Print UPI QR
              </Checkbox>
            </Box>
          </Stack>
        </Skeleton>
        <Flex justifyContent={"center"} alignItems={"center"}>
          <Button
            type="submit"
            isLoading={printFormik.isSubmitting}
            size={"sm"}
            colorScheme="blue"
          >
            Update
          </Button>
        </Flex>
      </Stack>
    </form>
  );
}
