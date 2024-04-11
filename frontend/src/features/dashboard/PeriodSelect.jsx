import React from "react";
import { Select } from "chakra-react-select";
export default function PeriodSelect({ currentPeriod, onChangePeriod }) {
  const periods = [
    {
      label: "This week",
      value: "lastWeek",
    },
    {
      label: "This month",
      value: "lastMonth",
    },
    {
      label: "This year",
      value: "lastYear",
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
