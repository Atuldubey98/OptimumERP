import { 
  FormControl, 
  Stack, 
  Box, 
  Text, 
  Flex,
  Icon,
  useColorModeValue
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineCalendar, HiOutlineArrowRight, HiOutlineArrowDown } from "react-icons/hi";
import moment from "moment";

const MONTHS = [
  { value: "0", label: "January" }, { value: "1", label: "February" }, { value: "2", label: "March" },
  { value: "3", label: "April" }, { value: "4", label: "May" }, { value: "5", label: "June" },
  { value: "6", label: "July" }, { value: "7", label: "August" }, { value: "8", label: "September" },
  { value: "9", label: "October" }, { value: "10", label: "November" }, { value: "11", label: "December" },
];

const YEARS = Array.from({ length: 10 }, (_, i) => ({
  value: (2024 + i).toString(),
  label: (2024 + i).toString(),
}));

export default function MonthYearFilter({ onChangeDateFilter }) {
  const { t } = useTranslation("report");
  
  const bg = useColorModeValue("gray.50", "whiteAlpha.50");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const hoverBg = useColorModeValue("indigo.50", "whiteAlpha.100");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const arrowColor = useColorModeValue("gray.300", "gray.600");

  const [filter, setFilter] = useState({
    startMonth: new Date().getMonth().toString(),
    startYear: new Date().getFullYear().toString(),
    endMonth: new Date().getMonth().toString(),
    endYear: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    const startDate = moment([filter.startYear, filter.startMonth]).startOf("month").format("YYYY-MM-DD");
    const endDate = moment([filter.endYear, filter.endMonth]).endOf("month").format("YYYY-MM-DD");
    onChangeDateFilter({ start: startDate, end: endDate });
  }, [filter, onChangeDateFilter]);

  const handleSelectChange = (name, value) => {
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const GroupContainer = ({ label, children }) => (
    <Box 
      width="100%"
      flex="1" 
      p={3} 
      bg={bg} 
      borderRadius="xl" 
      border="1px solid" 
      borderColor={borderColor}
      _hover={{ borderColor: "indigo.300", bg: hoverBg }}
      transition="all 0.2s"
    >
      <Flex alignItems="center" mb={2} gap={2}>
        <Icon as={HiOutlineCalendar} color="indigo.500" />
        <Text fontSize="xs" fontWeight="bold" color={labelColor} textTransform="uppercase" letterSpacing="wider">
          {label}
        </Text>
      </Flex>
      <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
        {children}
      </Stack>
    </Box>
  );

  return (
    <Flex 
      width="100%" 
      alignItems="center" 
      gap={4} 
      flexDir={{ base: "column", md: "row" }}
    >
      <GroupContainer label={t("report_ui.filters.start_range") || "From"}>
        <FormControl size="sm">
          <Select
            size="sm"
            options={MONTHS}
            value={MONTHS.find((m) => m.value === filter.startMonth)}
            onChange={(opt) => handleSelectChange("startMonth", opt.value)}
          />
        </FormControl>
        <FormControl size="sm">
          <Select
            size="sm"
            options={YEARS}
            value={YEARS.find((y) => y.value === filter.startYear)}
            onChange={(opt) => handleSelectChange("startYear", opt.value)}
          />
        </FormControl>
      </GroupContainer>

      <Flex 
        alignItems="center" 
        justifyContent="center" 
      >
        <Icon 
          as={HiOutlineArrowRight} 
          w={6} h={6} 
          color={arrowColor} 
          display={{ base: "none", md: "flex" }}
        />
        <Icon 
          as={HiOutlineArrowDown} 
          w={5} h={5} 
          color={arrowColor} 
          display={{ base: "flex", md: "none" }}
        />
      </Flex>

      <GroupContainer label={t("report_ui.filters.end_range") || "To"}>
        <FormControl size="sm">
          <Select
            size="sm"
            options={MONTHS}
            value={MONTHS.find((m) => m.value === filter.endMonth)}
            onChange={(opt) => handleSelectChange("endMonth", opt.value)}
          />
        </FormControl>
        <FormControl size="sm">
          <Select
            size="sm"
            options={YEARS}
            value={YEARS.find((y) => y.value === filter.endYear)}
            onChange={(opt) => handleSelectChange("endYear", opt.value)}
          />
        </FormControl>
      </GroupContainer>
    </Flex>
  );
}
