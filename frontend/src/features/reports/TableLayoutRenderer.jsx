import {
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function TableLayoutRenderer({
  reportType,
  currentReport,
  totalCount,
  items,
}) {
  const { t } = useTranslation(["report", "tax"]);

  return (
    <TableContainer overflowX="auto" width="100%">
      <Table size={"sm"} variant="simple">
        <TableCaption>
          {t("report_ui.table.total_found", {
            reportType: t(`report_ui.report_names.${reportType}`).toUpperCase(),
            count: totalCount,
          })}
        </TableCaption>
        <Thead>
          <Tr>
            {Object.entries(currentReport.header).map(([key, value]) => (
              <Th key={key} whiteSpace="nowrap">
                {value}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {Array.isArray(items) &&
            items
              .map(currentReport.bodyMapper)
              .map(({ _id, ...reportItem }) => (
                <Tr key={_id}>
                  {Object.keys(currentReport.header).map((key) => (
                    <Td key={key} whiteSpace="nowrap">
                      {reportItem[key]}
                    </Td>
                  ))}
                </Tr>
              ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
