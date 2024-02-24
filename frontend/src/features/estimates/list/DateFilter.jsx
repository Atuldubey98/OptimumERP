import { FormControl, FormLabel, Grid, Input } from "@chakra-ui/react";

export default function DateFilter({ dateFilter, onChangeDateFilter }) {
  return (
    <>
      <FormControl>
        <FormLabel fontWeight={"bold"}>Start Date</FormLabel>
        <Input
          name="startDate"
          value={dateFilter.startDate}
          onChange={onChangeDateFilter}
          placeholder="dd-mm-yyyy"
          type="date"
        />
      </FormControl>
      <FormControl>
        <FormLabel fontWeight={"bold"}>End Date</FormLabel>
        <Input
          value={dateFilter.endDate}
          placeholder="dd-mm-yyyy"
          type="date"
          name="endDate"
          onChange={onChangeDateFilter}
        />
      </FormControl>
    </>
  );
}
