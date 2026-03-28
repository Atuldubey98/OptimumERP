import {
  Button,
  Flex,
  FormControl,
  PinInput,
  PinInputField,
  Stack,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import OTPAlert from "../forgot-password/OTPAlert";

export default function VerficationEmailForm(props) {
  const { t } = useTranslation("user");
  const scope = props.scope || "register";
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
        {t(`user_ui.${scope}.verify_button`)}
      </Button>
    </Stack>
  );
}
