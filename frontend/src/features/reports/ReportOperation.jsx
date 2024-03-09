import { Box } from "@chakra-ui/react";
import React from "react";
import ExportButton from "./ExportButton";

export default function ReportOperation({ dateFilter }) {
  return (
    <Box>
      <ExportButton dateFilter={dateFilter} />
    </Box>
  );
}
