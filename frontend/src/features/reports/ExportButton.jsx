import { Button } from "@chakra-ui/react";
import React from "react";
import { TbTableExport } from "react-icons/tb";
import { useParams } from "react-router-dom";
import { baseURL } from "../../instance";
import { useTranslation } from "react-i18next";

export default function ExportButton({ dateFilter, typeOfReport }) {
  const { t } = useTranslation("report");
  const { orgId, reportType = typeOfReport } = useParams();

  return (
    <>
      <Button
        as={"a"}
        size={"sm"}
        download
        colorScheme="green"
        leftIcon={<TbTableExport />}
        href={`${baseURL}/api/v1/organizations/${orgId}/reports/${reportType}/download?startDate=${dateFilter.startDate}&endDate=${dateFilter.endDate}`}
      >
        {t("report_ui.actions.export")}
      </Button>
    </>
  );
}
