import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import HelpPopover from "../common/HelpPopover";

export default function CurrentOrgDetailsForm({
  handleChange,
  handleSubmit,
  currentSelectedOrganization,
  isSubmitting,
}) {
  const bg = useColorModeValue("gray.100", "gray.700");
  const { t } = useTranslation("admin");
  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
       
        <Box>
          <Flex justifyContent={"space-between"} alignItems={"center"}>
            <HelpPopover
              title={t("organization.help_title")}
              description={t("organization.help_description")}
            />
            <Button
              size={"sm"}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="blue"
            >
              {t("actions.save")}
            </Button>
          </Flex>
          <SimpleGrid gap={3} minChildWidth={300}>
            <FormControl isRequired>
              <FormLabel>{t("organization.fields.name")}</FormLabel>
              <Input
                onChange={handleChange}
                name="name"
                value={currentSelectedOrganization.name}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>{t("organization.fields.address")}</FormLabel>
              <Input
                onChange={handleChange}
                name="address"
                value={currentSelectedOrganization.address}
              />
            </FormControl>
            <FormControl>
              <FormLabel>{t("organization.fields.gst_no")}</FormLabel>
              <Input
                onChange={handleChange}
                name="gstNo"
                value={currentSelectedOrganization.gstNo}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>{t("organization.fields.pan_no")}</FormLabel>
              <Input
                onChange={handleChange}
                name="panNo"
                value={currentSelectedOrganization.panNo}
              />
            </FormControl>
            <FormControl>
              <FormLabel>{t("organization.fields.website")}</FormLabel>
              <Input
                type="url"
                onChange={handleChange}
                name="web"
                value={currentSelectedOrganization.web}
              />
            </FormControl>
            <FormControl>
              <FormLabel>{t("organization.fields.telephone")}</FormLabel>
              <Input
                type="tel"
                onChange={handleChange}
                name="telephone"
                value={currentSelectedOrganization.telephone}
              />
            </FormControl>
            <FormControl>
              <FormLabel>{t("organization.fields.email")}</FormLabel>
              <Input
                type="email"
                onChange={handleChange}
                name="email"
                value={currentSelectedOrganization.email}
              />
            </FormControl>
          </SimpleGrid>
        </Box>
      </Stack>
    </form>
  );
}
