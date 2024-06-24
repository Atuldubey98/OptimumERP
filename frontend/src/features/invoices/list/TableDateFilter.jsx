import {
  Box,
  Flex
} from "@chakra-ui/react";
import FilterPopoverWrapper from "../../common/FilterPopoverWrapper";
import SearchItem from "../../common/table-layout/SearchItem";
import DateFilter from "../../estimates/list/DateFilter";

export default function TableDateFilter({ dateFilter, onChangeDateFilter }) {
 
  return (
    <Flex justifyContent={"flex-start"} alignItems={"center"} gap={2}>
      <Box flex={1}>
        <SearchItem placeholder="Search" />
      </Box>
      <FilterPopoverWrapper>
        <DateFilter
          dateFilter={dateFilter}
          onChangeDateFilter={onChangeDateFilter}
        />
      </FilterPopoverWrapper>
    </Flex>
  );
}
