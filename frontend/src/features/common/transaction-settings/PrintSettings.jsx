import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Skeleton,
  Stack,
  useColorModeValue,
  Divider,
  HStack,
  Switch,
  Text,
  useToast,
  Image,
  IconButton,
  Input,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiPrinter, FiLayout, FiCheckCircle } from "react-icons/fi";
import { MdDelete, MdOutlineFileUpload } from "react-icons/md";
import AuthContext from "../../../contexts/AuthContext";
import SettingContext from "../../../contexts/SettingContext";
import useProperty from "../../../hooks/useProperty";
import useStorageUtil from "../../../hooks/useStorageUtil";
import instance from "../../../instance";

export default function PrintSettings({ printFormik, formik, loading }) {
  const { t } = useTranslation("common");
  const auth = useContext(AuthContext);
  const currentPlan = auth?.user?.currentPlan
    ? auth?.user?.currentPlan.plan
    : "free";

  const bg = useColorModeValue("gray.100", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");

  const { value: templates = [] } = useProperty("TEMPLATES_CONFIG");
  const templateOptions = templates.map((template) => ({
    label: template.name,
    value: template.value,
  }));

  const settingContext = useContext(SettingContext);
  const { getFileUrl } = useStorageUtil();
  const signatureUrl = getFileUrl(settingContext?.setting?.signature);
  const [signatureStatus, setSignatureStatus] = useState("idle");
  const signatureInputRef = useRef(null);
  const toast = useToast();

  const handleSignatureUpload = async (e) => {
    try {
      setSignatureStatus("uploading");
      const file = e.currentTarget.files[0];
      if (!file) return;
      const form = new FormData();
      form.append("signature", file);
      await instance.post(
        `/api/v1/organizations/${formik.values.organization}/settings/signature`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (settingContext.fetchSetting) {
        await settingContext.fetchSetting(formik.values.organization);
      }
      toast({
        title: t("common_ui.toasts.success"),
        description: "Signature uploaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t("common_ui.toasts.error"),
        description: error?.response?.data?.message || "Failed to upload signature",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSignatureStatus("idle");
    }
  };

  const handleSignatureDelete = async () => {
    try {
      setSignatureStatus("deleting");
      await instance.delete(
        `/api/v1/organizations/${formik.values.organization}/settings/signature`
      );
      if (settingContext.fetchSetting) {
        await settingContext.fetchSetting(formik.values.organization);
      }
      toast({
        title: t("common_ui.toasts.success"),
        description: "Signature removed successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t("common_ui.toasts.error"),
        description: error?.response?.data?.message || "Failed to remove signature",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSignatureStatus("idle");
    }
  };

  return (
    <form onSubmit={printFormik.handleSubmit}>
      <Stack spacing={6}>
        <Flex justify="space-between" align="center" bg={bg} p={3} borderRadius="md">
          <HStack spacing={3}>
            <FiPrinter size={20} />
            <Heading fontSize={"lg"}>{t("common_ui.print_settings.title")}</Heading>
          </HStack>
          <Button
            type="submit"
            isLoading={printFormik.isSubmitting}
            size={"sm"}
            colorScheme="blue"
            leftIcon={<FiCheckCircle />}
            borderRadius="md"
          >
            {t("common_ui.actions.save")}
          </Button>
        </Flex>

        <Skeleton isLoaded={!loading}>
          <Box 
            p={6} 
            borderWidth="1px" 
            borderColor={borderColor} 
            borderRadius="lg" 
            bg={cardBg}
            shadow="sm"
          >
            <Stack spacing={8}>
              <FormControl>
                <FormLabel fontWeight="600" fontSize="sm" mb={3}>
                  <HStack spacing={2}>
                    <FiLayout size={14} />
                    <Text>{t("common_ui.print_settings.default_template")}</Text>
                  </HStack>
                </FormLabel>
                <Select
                  options={templateOptions}
                  onChange={({ value }) => {
                    printFormik.setFieldValue("defaultTemplate", value);
                  }}
                  value={templateOptions.find(
                    (templateOption) =>
                      templateOption.value === printFormik?.values?.defaultTemplate
                  )}
                  chakraStyles={{
                    control: (provided) => ({
                      ...provided,
                      borderRadius: "md",
                      fontSize: "14px"
                    }),
                  }}
                />
              </FormControl>

              <Divider />

              <Stack spacing={4}>
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  Display Options
                </Text>
                
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="600" fontSize="sm">
                      {t("common_ui.print_settings.print_bank_details")}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Include organization bank info on generated documents
                    </Text>
                  </Box>
                  <Switch
                    colorScheme="blue"
                    isDisabled={!formik.values?.organization}
                    name="bank"
                    onChange={printFormik.handleChange}
                    isChecked={printFormik.values?.bank}
                  />
                </Flex>

                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="600" fontSize="sm">
                      {t("common_ui.print_settings.print_upi_qr")}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Display a scanable UPI QR code for easy payments
                    </Text>
                  </Box>
                  <Switch
                    colorScheme="blue"
                    isDisabled={!formik.values?.organization || currentPlan === "free"}
                    name="upiQr"
                    onChange={printFormik.handleChange}
                    isChecked={printFormik.values?.upiQr}
                    title={
                      currentPlan === "free"
                        ? t("common_ui.table.upgrade_your_plan")
                        : null
                    }
                  />
                </Flex>

                <Divider />

                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  Authorized Signature
                </Text>
                
                <Flex gap={4} align="center">
                  <Box
                    p={2}
                    borderRadius={"md"}
                    border={"1px solid"}
                    borderColor={borderColor}
                    bg={useColorModeValue("gray.50", "gray.900")}
                    minW={"100px"}
                    minH={"60px"}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {signatureUrl ? (
                      <Image
                        maxH={"50px"}
                        objectFit="contain"
                        src={signatureUrl}
                        alt="Authorized Signature"
                      />
                    ) : (
                      <Text fontSize="xs" color="gray.400">No Signature</Text>
                    )}
                  </Box>
                  
                  <Stack spacing={1}>
                    <Text fontSize="xs" color="gray.500">
                      Upload an image of your signature (PNG/JPG) to display on documents
                    </Text>
                    <HStack spacing={2}>
                      <Input
                        ref={signatureInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleSignatureUpload}
                        display={"none"}
                      />
                      <Button
                        size={"sm"}
                        leftIcon={<MdOutlineFileUpload />}
                        colorScheme="yellow"
                        isLoading={signatureStatus === "uploading"}
                        onClick={() => signatureInputRef.current.click()}
                        isDisabled={!formik.values?.organization}
                      >
                        Upload
                      </Button>
                      {signatureUrl && (
                        <IconButton
                          size={"sm"}
                          colorScheme="red"
                          variant={"outline"}
                          isLoading={signatureStatus === "deleting"}
                          icon={<MdDelete />}
                          onClick={handleSignatureDelete}
                          isDisabled={!formik.values?.organization}
                        />
                      )}
                    </HStack>
                  </Stack>
                </Flex>
              </Stack>
            </Stack>
          </Box>
        </Skeleton>
      </Stack>
    </form>
  );
}
