import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Divider,
  IconButton,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { IoCheckmark } from "react-icons/io5";
import FilterPopoverWrapper from "../../common/FilterPopoverWrapper";
import SearchItem from "../../common/table-layout/SearchItem";
import DateFilter from "../../estimates/list/DateFilter";
import PartySelectBill from "../../invoices/create/PartySelectBill";
import { useTranslation } from "react-i18next";

export default function TableDateFilter({ dateFilter, onChangeDateFilter }) {
  const { t } = useTranslation("common");
  const [localNum, setLocalNum] = useState(dateFilter.num || "");

  useEffect(() => {
    setLocalNum(dateFilter.num || "");
  }, [dateFilter.num]);

  const onApplyNum = () => {
    onChangeDateFilter({
      currentTarget: {
        name: "num",
        value: localNum,
      },
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onApplyNum();
    }
  };

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
          isFiltered={!!dateFilter.num || !!dateFilter.party}
        >
          <Stack spacing={4}>
            <FormControl size="sm">
              <FormLabel fontSize="xs" fontWeight="bold" mb={1}>
                {t("common_ui.search.document_no")}
              </FormLabel>
              <InputGroup size="sm">
                <Input
                  name="num"
                  value={localNum}
                  onChange={(e) => setLocalNum(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("common_ui.search.doc_no_placeholder")}
                  borderRadius="md"
                  pr="2.5rem"
                />
                <InputRightElement width="2.5rem">
                  <IconButton
                    h="1.5rem"
                    size="xs"
                    icon={<IoCheckmark size={16} />}
                    colorScheme="blue"
                    onClick={onApplyNum}
                    aria-label="Apply"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            
            <Divider />

            <Box>
               <FormLabel fontSize="xs" fontWeight="bold" mb={1}>
                 {t("common_ui.fields.party")}
               </FormLabel>
                <PartySelectBill 
                  formik={partyFormik} 
                  isCreatable={false}
                  size="sm"
                />
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
