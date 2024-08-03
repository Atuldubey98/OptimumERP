import {
  Button,
  Flex,
  FormControl,
  PinInput,
  PinInputField,
  Stack,
} from "@chakra-ui/react";
import OTPAlert from "../forgot-password/OTPAlert";

export default function VerficationEmailForm(props) {
  return (
    <Stack>
      <OTPAlert />
      <FormControl isRequired>
        <Flex justifyContent={"center"} alignItems={"center"} gap={3}>
          <PinInput
            value={props.verifyRegisteredUserFormik.values.otp}
            onChange={(value) =>
              props.verifyRegisteredUserFormik.setFieldValue("otp", value)
            }
            otp
          >
            <PinInputField />
            <PinInputField />
            <PinInputField />
            <PinInputField />
          </PinInput>
        </Flex>
      </FormControl>
      <Button
        type="submit"
        isLoading={props.verifyRegisteredUserFormik.isSubmitting}
        colorScheme="blue"
      >
        Verify
      </Button>
    </Stack>
  );
}
