import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Skeleton,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import AuthContext from "../../../contexts/AuthContext";
import useProperty from "../../../hooks/useProperty";
export default function PrintSettings({ printFormik, formik, loading }) {
  const { t } = useTranslation("common");
  const auth = useContext(AuthContext);
  const currentPlan = auth?.user?.currentPlan
    ? auth?.user?.currentPlan.plan
    : "free";
  const bg = useColorModeValue("gray.100", "gray.700");
  const { value : templates = []} = useProperty("TEMPLATES_CONFIG");
  const templateOptions = templates.map((template) => ({
    label: template.name,
    value: template.value,
  }));  
  
  return (
    <form onSubmit={printFormik.handleSubmit}>
      <Stack>
        <Box bg={bg} p={3}>
          <Heading fontSize={"lg"}>{t("common_ui.print_settings.title")}</Heading>
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
                {t("common_ui.actions.save")}
              </Button>
            </Flex>
            <FormControl>
              <FormLabel>{t("common_ui.print_settings.default_template")}</FormLabel>
              <Select
                options={templateOptions}
                onChange={({ value }) =>
                 {
                   printFormik.setFieldValue("defaultTemplate", value);
                 
                 }
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
                isDisabled={!formik.values?.organization}
                name="bank"
                onChange={printFormik.handleChange}
                isChecked={printFormik.values?.bank}
              >
                {t("common_ui.print_settings.print_bank_details")}
              </Checkbox>
            </Box>

            <Checkbox
              title={
                currentPlan === "free"
                  ? t("common_ui.table.upgrade_your_plan")
                  : null
              }
              isDisabled={!formik.values?.organization || currentPlan === "free"}
              name="upiQr"
              onChange={printFormik.handleChange}
              isChecked={printFormik.values?.upiQr}
            >
              {t("common_ui.print_settings.print_upi_qr")}
            </Checkbox>
          </Stack>
        </Skeleton>
      </Stack>
    </form>
  );
}
