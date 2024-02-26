import { Box, Divider, Grid } from "@chakra-ui/react";
import SearchItem from "../../common/table-layout/SearchItem";
import DateFilter from "./DateFilter";

export default function BillFilter({ dateFilter, onChangeDateFilter }) {
  return (
    <Grid gap={2}>
      <Divider />
      <Box>
        <SearchItem placeholder="Search by description" />
      </Box>
      <Grid gap={5} gridTemplateColumns={"1fr 1fr"}>
        <DateFilter
          dateFilter={dateFilter}
          onChangeDateFilter={onChangeDateFilter}
        />
      </Grid>
      <Divider />
    </Grid>
  );
}
