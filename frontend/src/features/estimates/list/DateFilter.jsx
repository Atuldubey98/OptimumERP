import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  SimpleGrid,
  Input,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { IoCloseCircleOutline, IoRefreshOutline } from "react-icons/io5";
import moment from "moment";

export default function DateFilter({
  dateFilter,
  onChangeDateFilter,
  isRequired,
  columns = { base: 1, md: 2 },
  size = "sm",
  buttonPosition = "bottom",
}) {
  const { t } = useTranslation("common");
  const inputBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const focusBorderColor = useColorModeValue("blue.500", "blue.300");

  const hasDateFilter = Boolean(dateFilter?.startDate || dateFilter?.endDate);

  const handleClearDate = () => {
    if (typeof onChangeDateFilter === "function") {
      try {
        onChangeDateFilter({
          startDate: "",
          endDate: "",
        });
      } catch (err) {
        onChangeDateFilter({ currentTarget: { name: "startDate", value: "" } });
        onChangeDateFilter({ currentTarget: { name: "endDate", value: "" } });
      }
    }
  };

  const handleResetDefault = () => {
    if (typeof onChangeDateFilter === "function") {
      const today = moment().format("YYYY-MM-DD");
      const monthAgo = moment().subtract(30, "days").format("YYYY-MM-DD");
      try {
        onChangeDateFilter({
          startDate: monthAgo,
          endDate: today,
        });
      } catch (err) {
        onChangeDateFilter({ currentTarget: { name: "startDate", value: monthAgo } });
        onChangeDateFilter({ currentTarget: { name: "endDate", value: today } });
      }
    }
  };

  const renderActionButton = (isHeader = false) => {
    if (hasDateFilter) {
      return (
        <Button
          size="xs"
          variant="ghost"
          colorScheme="red"
          h={isHeader ? "auto" : undefined}
          py={isHeader ? 0.5 : undefined}
          px={isHeader ? 1.5 : undefined}
          minW="auto"
          leftIcon={<IoCloseCircleOutline size={14} />}
          onClick={handleClearDate}
          fontWeight="500"
          fontSize="xs"
        >
          {t("common_ui.date_filter.clear_date_filter", "Clear Date Filter")}
        </Button>
      );
    }

    return (
      <Button
        size="xs"
        variant="ghost"
        colorScheme="blue"
        h={isHeader ? "auto" : undefined}
        py={isHeader ? 0.5 : undefined}
        px={isHeader ? 1.5 : undefined}
        minW="auto"
        leftIcon={<IoRefreshOutline size={14} />}
        onClick={handleResetDefault}
        fontWeight="500"
        fontSize="xs"
      >
        {t("common_ui.date_filter.reset_default", "Reset to 30 Days")}
      </Button>
    );
  };

  return (
    <Box w="full">
      <SimpleGrid columns={columns} spacing={4} w="full">
        <FormControl size={size} isRequired={isRequired} minW={0}>
          {buttonPosition === "header" ? (
            <Flex align="center" mb={1} minH="20px">
              <FormLabel fontSize="xs" fontWeight={"bold"} mb={0} color={labelColor} whiteSpace="nowrap">
                {t("common_ui.date_filter.start_date")}
              </FormLabel>
            </Flex>
          ) : (
            <FormLabel fontSize="xs" fontWeight={"bold"} mb={1} color={labelColor}>
              {t("common_ui.date_filter.start_date")}
            </FormLabel>
          )}
          <Input
            name="startDate"
            value={dateFilter?.startDate || ""}
            onChange={onChangeDateFilter}
            placeholder={t("common_ui.date_filter.placeholder")}
            type="date"
            size={size}
            borderRadius="md"
            bg={inputBg}
            borderWidth="1px"
            borderColor={borderColor}
            w="full"
            _hover={{ borderColor: useColorModeValue("gray.300", "gray.600") }}
            _focus={{ borderColor: focusBorderColor, boxShadow: `0 0 0 1px ${focusBorderColor}` }}
          />
        </FormControl>
        <FormControl size={size} isRequired={isRequired} minW={0}>
          {buttonPosition === "header" ? (
            <Flex justify="space-between" align="center" mb={1} minH="20px" gap={1}>
              <FormLabel fontSize="xs" fontWeight={"bold"} mb={0} color={labelColor} whiteSpace="nowrap">
                {t("common_ui.date_filter.end_date")}
              </FormLabel>
              {renderActionButton(true)}
            </Flex>
          ) : (
            <FormLabel fontSize="xs" fontWeight={"bold"} mb={1} color={labelColor}>
              {t("common_ui.date_filter.end_date")}
            </FormLabel>
          )}
          <Input
            value={dateFilter?.endDate || ""}
            placeholder={t("common_ui.date_filter.placeholder")}
            type="date"
            size={size}
            name="endDate"
            onChange={onChangeDateFilter}
            borderRadius="md"
            bg={inputBg}
            borderWidth="1px"
            borderColor={borderColor}
            w="full"
            _hover={{ borderColor: useColorModeValue("gray.300", "gray.600") }}
            _focus={{ borderColor: focusBorderColor, boxShadow: `0 0 0 1px ${focusBorderColor}` }}
          />
        </FormControl>
      </SimpleGrid>

      {buttonPosition === "bottom" && (
        <Flex justify="flex-end" align="center" mt={3}>
          {renderActionButton(false)}
        </Flex>
      )}
    </Box>
  );
}
