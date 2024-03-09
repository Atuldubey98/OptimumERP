import React from "react";
import MainLayout from "../common/main-layout";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import useAsyncCall from "../../hooks/useAsyncCall";
import instance from "../../instance";

export default function ProfileSettingsPage() {
  const { requestAsyncHandler } = useAsyncCall();
  const toast = useToast();
  const {
    setFieldError,
    values,
    handleChange,
    errors,
    resetForm,
    handleSubmit,
    isSubmitting,
  } = useFormik({
    initialValues: {
      currentPassword: "",
      confirmNewPassword: "",
      newPassword: "",
    },
    onSubmit: requestAsyncHandler(async (data, { setSubmitting }) => {
      if (data.confirmNewPassword !== data.newPassword) {
        setFieldError(
          "confirmNewPassword",
          "Confirm password is not equal to new password"
        );
        setSubmitting(false);
        return;
      }
      const response = await instance.post(`/api/v1/users/reset-password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast({
        title: "Password",
        description: response.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      resetForm();
      setSubmitting(false);
    }),
  });
  return (
    <MainLayout>
      <Box p={5}>
        <Text fontStyle={"italic"} fontSize={"md"}>
          Here you can change you account password
        </Text>
        <Box maxW={"xl"}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3} marginBlock={6}>
              <FormControl
                isRequired
                isInvalid={errors.currentPassword && errors.currentPassword}
              >
                <FormLabel>Current password</FormLabel>
                <Input
                  value={values.currentPassword}
                  onChange={handleChange}
                  name="currentPassword"
                  placeholder="Current Password"
                />
                <FormErrorMessage>{errors.currentPassword}</FormErrorMessage>
              </FormControl>
              <FormControl
                isRequired
                isInvalid={errors.newPassword && errors.newPassword}
              >
                <FormLabel>New password</FormLabel>
                <Input
                  value={values.newPassword}
                  onChange={handleChange}
                  name="newPassword"
                  placeholder="New password"
                />
                <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
              </FormControl>
              <FormControl
                isRequired
                isInvalid={
                  errors.confirmNewPassword && errors.confirmNewPassword
                }
              >
                <FormLabel>Confirm password</FormLabel>
                <Input
                  value={values.confirmNewPassword}
                  onChange={handleChange}
                  name="confirmNewPassword"
                  placeholder="Confirm Password"
                />
                <FormErrorMessage>{errors.confirmNewPassword}</FormErrorMessage>
              </FormControl>
            </Stack>
            <Flex justifyContent={"center"} alignItems={"center"}>
              <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
                Update password
              </Button>
            </Flex>
          </form>
        </Box>
      </Box>
    </MainLayout>
  );
}
