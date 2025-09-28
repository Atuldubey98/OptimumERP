import React from "react";
import { Select } from "chakra-react-select";
export default function PeriodSelect({ currentPeriod, onChangePeriod }) {
  const periods = [
    {
      label: "This week",
      value: "thisWeek",
    },
    {
      label: "This month",
      value: "thisMonth",
    },
    {
      label: "This year",
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
