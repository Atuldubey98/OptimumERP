import {
  Box,
  Flex,
  Stack,
  Divider,
} from "@chakra-ui/react";
import FilterPopoverWrapper from "../../common/FilterPopoverWrapper";
import SearchItem from "../../common/table-layout/SearchItem";
import DateFilter from "../../estimates/list/DateFilter";
import { useTranslation } from "react-i18next";

export default function TableDateFilter({ dateFilter, onChangeDateFilter }) {
  const { t } = useTranslation("common");

  return (
    <Flex 
      direction={{ base: "column", sm: "row" }} 
      justifyContent={"flex-start"} 
      alignItems={{ base: "stretch", sm: "center" }} 
      gap={3}
      w="100%"
    >
      <Box flex={1}>
        <SearchItem />
      </Box>
      <Box>
        <FilterPopoverWrapper 
          title={t("common_ui.filters")}
          isFiltered={false}
        >
          <Stack spacing={4}>
            <DateFilter
              dateFilter={dateFilter}
              onChangeDateFilter={onChangeDateFilter}
            />
          </Stack>
        </FilterPopoverWrapper>
      </Box>
    </Flex>
  );
}
