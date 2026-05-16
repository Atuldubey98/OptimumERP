import {
  Box,
  Flex,
  Stack,
  Divider,
  FormLabel,
} from "@chakra-ui/react";
import FilterPopoverWrapper from "../../common/FilterPopoverWrapper";
import SearchItem from "../../common/table-layout/SearchItem";
import DateFilter from "../../estimates/list/DateFilter";
import PartySelectBill from "../../invoices/create/PartySelectBill";
import { useTranslation } from "react-i18next";

export default function TableDateFilter({ dateFilter, onChangeDateFilter }) {
  const { t } = useTranslation("common");

  const partyFormik = {
    values: { 
      party: dateFilter.party,
      partyDetails: dateFilter.partyDetails 
    },
    setFieldValue: (field, value) => {
      onChangeDateFilter({
        [field]: value,
      });
    },
    errors: {},
    touched: {},
  };

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
          isFiltered={!!dateFilter.party}
        >
          <Stack spacing={4}>
            <Box>
               <FormLabel fontSize="xs" fontWeight="bold" mb={1}>
                 {t("common_ui.fields.party")}
               </FormLabel>
               <PartySelectBill formik={partyFormik} />
            </Box>
            <Divider />
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
