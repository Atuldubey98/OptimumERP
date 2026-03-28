import React from "react";
import { useTranslation } from "react-i18next";
import { Select } from "chakra-react-select";
export default function PeriodSelect({ currentPeriod, onChangePeriod }) {
  const { t } = useTranslation("dashboard");
  const periods = [
    {
      label: t("dashboard_ui.periods.this_week"),
      value: "thisWeek",
    },
    {
      label: t("dashboard_ui.periods.this_month"),
      value: "thisMonth",
    },
    {
      label: t("dashboard_ui.periods.this_year"),
      value: "thisYear",
    },
  ];
  return (
    <Select
      options={periods}
      onChange={onChangePeriod}
      value={periods.find((period) => period.value === currentPeriod)}
    />
  );
}
