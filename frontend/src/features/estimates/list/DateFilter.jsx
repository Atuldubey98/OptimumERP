import { FormControl, FormLabel, Stack, Input } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function DateFilter({
  dateFilter,
  onChangeDateFilter,
  isRequired,
}) {
  const { t } = useTranslation("common");
  return (
    <Stack spacing={3}>
      <FormControl size={"sm"} isRequired={isRequired}>
        <FormLabel fontSize="xs" fontWeight={"bold"} mb={1}>
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
        />
      </FormControl>
      <FormControl size={"sm"} isRequired={isRequired}>
        <FormLabel fontSize="xs" fontWeight={"bold"} mb={1}>
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
        />
      </FormControl>
    </Stack>
  );
}
