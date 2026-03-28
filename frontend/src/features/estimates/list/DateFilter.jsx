import { FormControl, FormLabel, Grid, Input } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function DateFilter({
  dateFilter,
  onChangeDateFilter,
  isRequired,
}) {
  const { t } = useTranslation("common");
  return (
    <>
      <FormControl size={"sm"} isRequired={isRequired}>
        <FormLabel fontWeight={"bold"}>{t("common_ui.date_filter.start_date")}</FormLabel>
        <Input
          name="startDate"
          value={dateFilter.startDate}
          onChange={onChangeDateFilter}
          placeholder={t("common_ui.date_filter.placeholder")}
          type="date"
        />
      </FormControl>
      <FormControl size={"sm"} isRequired={isRequired}>
        <FormLabel fontWeight={"bold"}>{t("common_ui.date_filter.end_date")}</FormLabel>
        <Input
          value={dateFilter.endDate}
          placeholder={t("common_ui.date_filter.placeholder")}
          type="date"
          name="endDate"
          onChange={onChangeDateFilter}
        />
      </FormControl>
    </>
  );
}
