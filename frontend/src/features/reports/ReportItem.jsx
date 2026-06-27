import {
  Box,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useDateFilterFetch from "../../hooks/useDateFilterFetch";
import Pagination from "../common/main-layout/Pagination";
import ReportOperation from "./ReportOperation";
import moment from "moment";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import MonthYearFilter from "./MonthYearFilter";
import SummaryReportRenderer from "./SummaryReportRenderer";
import TableLayoutRenderer from "./TableLayoutRenderer";

const getBillGrandTotal = (bill) =>
  Number(bill?.total || 0) +
  Number(bill?.totalTax || 0) +
  Number(bill?.shippingCharges || 0);

const DEFAULT_GSTR_TAX_CATEGORIES = [];
const PREFERRED_TAX_CATEGORY_ORDER = [
  "cgst",
  "sgst",
  "igst",
  "vat",
  "cess",
  "sal",
  "others",
  "none",
];

const getTaxCategoryAmount = (taxCategories, category) =>
  taxCategories?.[category] || 0;

const getOrderedTaxCategoryKeys = (items = [], defaultCategories = []) => {
  const taxCategoryKeys = new Set(defaultCategories);
  if (Array.isArray(items)) {
    items.forEach((item) => {
      Object.entries(item.taxCategories || {}).forEach(([key, amount]) => {
        if (amount !== undefined && amount !== null) taxCategoryKeys.add(key);
      });
    });
  }
  return Array.from(taxCategoryKeys).sort((left, right) => {
    const leftIndex = PREFERRED_TAX_CATEGORY_ORDER.indexOf(left);
    const rightIndex = PREFERRED_TAX_CATEGORY_ORDER.indexOf(right);
    if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right);
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });
};

const formatReportDate = (value) => (value ? moment(value).format("LL") : "");

export default function ReportItem() {
  const { t } = useTranslation(["report", "tax"]);
  const { reportType } = useParams();
  const { formatSmallestUnitWithSymbol } = useCurrentOrgCurrency();
  const { onSetDateFilter, ...response } = useDateFilterFetch({
    entity: `reports/${reportType}`,
  });

  const transactionTypes = {
    invoice: t("report_ui.transaction_types.invoice"),
    purchase: t("report_ui.transaction_types.purchase"),
    expense: t("report_ui.transaction_types.expense"),
    quotes: t("report_ui.transaction_types.quotes"),
    proforma_invoice: t("report_ui.transaction_types.proforma_invoice"),
    purchase_order: t("report_ui.transaction_types.purchase_order"),
    payment_voucher: t("report_ui.transaction_types.payment_voucher"),
  };
  const buildGstrReportConfig = ({ items, dateLabel, numberLabel }) => {
    const taxCategoryKeys = getOrderedTaxCategoryKeys(
      items,
      DEFAULT_GSTR_TAX_CATEGORIES
    );
    const header = {
      gstNo: t("report_ui.table.headers.gstr.gst_no"),
      partyName: t("report_ui.table.headers.gstr.party_name"),
      date: dateLabel,
      num: numberLabel,
    };
    taxCategoryKeys.forEach((key) => {
      header[key] = t(`tax_ui.category_options.${key}`, {
        ns: "tax",
        defaultValue: key.toUpperCase(),
      });
    });
    header.totalTax = t("report_ui.table.headers.gstr.total_tax", {
      defaultValue: t("report_ui.table.headers.sale.total_tax"),
    });
    header.grandTotal = t("report_ui.table.headers.gstr.grand_total");
    return {
      header,
      bodyMapper: (item) => ({
        _id: item._id,
        partyName: item.party?.name,
        gstNo: item.party?.gstNo,
        date: formatReportDate(item.date),
        num: item.num,
        ...Object.fromEntries(
          taxCategoryKeys.map((key) => [
            key,
            formatSmallestUnitWithSymbol(getTaxCategoryAmount(item.taxCategories, key)),
          ])
        ),
        grandTotal: formatSmallestUnitWithSymbol(getBillGrandTotal(item)),
        totalTax: formatSmallestUnitWithSymbol(item.totalTax),
      }),
    };
  };
  const reportDataByType = {
    sale: {
      header: {
        num: t("report_ui.table.headers.sale.num"),
        date: t("report_ui.table.headers.sale.date"),
        partyName: t("report_ui.table.headers.sale.party_name"),
        grandTotal: t("report_ui.table.headers.sale.grand_total"),
        totalTax: t("report_ui.table.headers.sale.total_tax"),
        status: t("report_ui.table.headers.sale.status"),
      },
      bodyMapper: (item) => ({
        _id: item._id,
        partyName: item.party?.name,
        num: item.num,
        date: formatReportDate(item.date),
        totalTax: formatSmallestUnitWithSymbol(item.totalTax),
        grandTotal: formatSmallestUnitWithSymbol(getBillGrandTotal(item)),
        status: (item?.status || "").toLocaleUpperCase(),
      }),
    },
    purchase: {
      header: {
        num: t("report_ui.table.headers.purchase.num"),
        date: t("report_ui.table.headers.purchase.date"),
        partyName: t("report_ui.table.headers.purchase.party_name"),
        grandTotal: t("report_ui.table.headers.purchase.grand_total"),
        totalTax: t("report_ui.table.headers.purchase.total_tax"),
        status: t("report_ui.table.headers.purchase.status"),
      },

      bodyMapper: (item) => ({
        _id: item._id,
        partyName: item.party?.name,
        num: item.num,
        date: formatReportDate(item.date),
        totalTax: formatSmallestUnitWithSymbol(item.totalTax),
        grandTotal: formatSmallestUnitWithSymbol(getBillGrandTotal(item)),
        status: (item?.status || "").toLocaleUpperCase(),
      }),
    },
    transactions: {
      header: {
        num: t("report_ui.table.headers.transactions.num"),
        type: t("report_ui.table.headers.transactions.type"),
        amount: t("report_ui.table.headers.transactions.amount"),
        createdAt: t("report_ui.table.headers.transactions.created_at"),
        relatedTo: t("report_ui.table.headers.transactions.related_to"),
      },
      bodyMapper: (item) => ({
        _id: item._id,
        num: item.doc?.num,
        type: transactionTypes[item?.docModel],
        amount: formatSmallestUnitWithSymbol(getBillGrandTotal(item)),
        relatedTo: item?.party?.name || item.doc?.description || "",
        createdAt: new Date(item.createdAt).toLocaleDateString(),
      }),
    },
    gstr1: buildGstrReportConfig({
      items: response.items,
      dateLabel: t("report_ui.table.headers.gstr.date"),
      numberLabel: t("report_ui.table.headers.gstr.num"),
    }),
    gstr2: buildGstrReportConfig({
      items: response.items,
      dateLabel: t("report_ui.table.headers.gstr.date"),
      numberLabel: t("report_ui.table.headers.gstr.num"),
    }),
    profitAndLoss: {
      Component: SummaryReportRenderer,
      hasPagination: false,
    },
  };
  const { status, totalCount, totalPages, currentPage } = response;
  const currentReport = reportDataByType[reportType];
  const Renderer = currentReport?.Component || TableLayoutRenderer;

  return (
    <Box maxW="100%" overflowX="hidden">
      <Flex 
        flexDir="column"
        gap={2} 
        mb={4}
        px={4}
        alignItems="center"
      >
        <Box width="100%">
          <MonthYearFilter 
            onChangeDateFilter={onSetDateFilter}
          />
        </Box>
        <Box>
          <ReportOperation dateFilter={response.dateFilter} />
        </Box>
      </Flex>
      {status === "loading" ? (
        <Flex marginBlock={5} justifyContent={"center"} alignItems={"center"}>
          <Spinner />
        </Flex>
      ) : (
        <Box p={2} width="100%" overflowX="auto">
          {reportType && currentReport ? (
            <Renderer
              data={response.items}
              reportType={reportType}
              currentReport={currentReport}
              totalCount={totalCount}
              items={response.items}
            />
          ) : null}
        </Box>
      )}
      {status === "loading" || currentReport?.hasPagination === false ? null : (
        <Pagination currentPage={currentPage} total={totalPages} />
      )}
    </Box>
  );
}
