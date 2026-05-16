import { SimpleGrid, Box, Flex, Icon, VStack, Text, useColorModeValue } from "@chakra-ui/react";
import { MdSettings, MdCalendarToday, MdHistory, MdReceipt } from "react-icons/md";
import moment from "moment";
import { useTranslation } from "react-i18next";
import Status from "../../../estimates/list/Status";
import { recurringInvoiceStatusList } from "../../../../constants/recurringInvoice";

const StatBox = ({ label, value, icon, color = "teal" }) => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  return (
    <Box p={5} shadow="sm" border="1px" borderColor={borderColor} borderRadius="xl" bg={bg}>
      <Flex align="center" gap={4}>
      <Flex p={3} borderRadius="lg" bg={`${color}.50`} color={`${color}.500`}>
        <Icon as={icon} boxSize={5} />
      </Flex>
      <VStack align="start" spacing={0}>
        <Text fontSize="sm" color="gray.500" fontWeight="medium">
          {label}
        </Text>
        <Box fontSize="lg" fontWeight="bold">
          {value}
        </Box>
      </VStack>
    </Flex>
    </Box>
  );
};

export default function StatCards({ ri }) {
  const { t } = useTranslation("recurringInvoice");

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
      <StatBox
        label="Interval"
        value={t(`recurring_invoice_ui.interval.${ri.interval}`)}
        icon={MdSettings}
        color="blue"
      />
      <StatBox
        label="Next Run"
        value={ri.nextOccurrence ? moment(ri.nextOccurrence).format("MMM DD, YYYY") : "Finished"}
        icon={MdCalendarToday}
        color="orange"
      />
      <StatBox
        label="Generated"
        value={`${ri.totalGenerated || 0} Documents`}
        icon={MdHistory}
        color="purple"
      />
      <StatBox
        label="Status"
        value={<Status status={ri.status} statusList={recurringInvoiceStatusList} />}
        icon={MdReceipt}
        color={ri.status === "active" ? "green" : "red"}
      />
    </SimpleGrid>
  );
}
