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
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { FiPrinter, FiLayout, FiCheckCircle } from "react-icons/fi";
import AuthContext from "../../../contexts/AuthContext";
import useProperty from "../../../hooks/useProperty";

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
              </Stack>
            </Stack>
          </Box>
        </Skeleton>
      </Stack>
    </form>
  );
}
