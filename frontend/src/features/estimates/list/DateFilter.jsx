import { FormControl, FormLabel, SimpleGrid, Input, useColorModeValue } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function DateFilter({
  dateFilter,
  onChangeDateFilter,
  isRequired,
  columns = { base: 1, md: 2 },
}) {
  const { t } = useTranslation("common");
  const inputBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const focusBorderColor = useColorModeValue("blue.500", "blue.300");

  return (
    <SimpleGrid columns={columns} spacing={4} w="full">
      <FormControl size={"sm"} isRequired={isRequired} minW={0}>
        <FormLabel fontSize="xs" fontWeight={"bold"} mb={1} color={labelColor}>
          {t("common_ui.date_filter.start_date")}
        </FormLabel>
        <Input
          name="startDate"
          value={dateFilter.startDate}
          onChange={onChangeDateFilter}
          placeholder={t("common_ui.date_filter.placeholder")}
          type="date"
          size={"sm"}
          borderRadius="md"
          bg={inputBg}
          borderWidth="1px"
          borderColor={borderColor}
          w="full"
          _hover={{ borderColor: useColorModeValue("gray.300", "gray.600") }}
          _focus={{ borderColor: focusBorderColor, boxShadow: `0 0 0 1px ${focusBorderColor}` }}
        />
      </FormControl>
      <FormControl size={"sm"} isRequired={isRequired} minW={0}>
        <FormLabel fontSize="xs" fontWeight={"bold"} mb={1} color={labelColor}>
          {t("common_ui.date_filter.end_date")}
        </FormLabel>
        <Input
          value={dateFilter.endDate}
          placeholder={t("common_ui.date_filter.placeholder")}
          type="date"
          size={"sm"}
          name="endDate"
          onChange={onChangeDateFilter}
          borderRadius="md"
          bg={inputBg}
          borderWidth="1px"
          borderColor={borderColor}
          w="full"
          _hover={{ borderColor: useColorModeValue("gray.300", "gray.600") }}
          _focus={{ borderColor: focusBorderColor, boxShadow: `0 0 0 1px ${focusBorderColor}` }}
        />
      </FormControl>
    </SimpleGrid>
  );
}
