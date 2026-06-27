const xl = require("excel4node");
const reportDataByType = require("../constants/reportDataByType");
const exportDataByReceiptType = require("../constants/exportDataByReceiptType");
const i18 = require("../i18");
const Invoice = require("../models/invoice.model");
const {
  INVOICES,
  PURCHASE_INVOICES,
  TRANSACTIONS,
} = require("../constants/entities");
const Purchase = require("../models/purchase.model");
const Transaction = require("../models/transaction.model");
const Expense = require("../models/expense.model");
const settingService = require("./setting.service");
const { Types } = require("mongoose");
const { dateUtils } = require("../utils");
const { getPaginationParams } = require("./crud.service");

exports.makeReportExcelBuffer = async ({
  reportData,
  reportType,
  isReport = true,
  selectedHeaderRows,
  decimalDigits,
  organization,
}) => {
  const reportTypes = isReport ? reportDataByType : exportDataByReceiptType;
  const reportMapper = reportTypes[reportType];
  if (!reportMapper)
    throw new Error(i18.t("common:common.report_type_not_found"));
  const { bodyMapper, header: headerRow } = reportMapper;
  const taxCategoryKeys = reportMapper.getTaxCategoryKeys
    ? reportMapper.getTaxCategoryKeys(reportData)
    : [];
  const header = isReport
    ? reportMapper.getHeader
      ? reportMapper.getHeader({ reportData, taxCategoryKeys })
      : headerRow
    : selectedHeaderRows;
  const reportItems = reportData.map((item) =>
    bodyMapper(item, { reportData, taxCategoryKeys, decimalDigits }),
  );

  const wb = new xl.Workbook();
  const ws = wb.addWorksheet("General");
  const headerStyle = wb.createStyle({
    font: {
      bold: true,
    },
    border: {
      outline: true,
    },
  });

  const numberStyle = wb.createStyle({
    numberFormat: decimalDigits > 0 ? `0.${"0".repeat(decimalDigits)}` : "0",
  });

  const writeHeader = (worksheet, headerObj, rowIndex) => {
    Object.values(headerObj).forEach((value, index) => {
      worksheet.column(index + 1).setWidth(18);
      worksheet
        .cell(rowIndex, index + 1)
        .string(value)
        .style(headerStyle);
    });
  };

  const priceFields = [
    "totalTax",
    "grandTotal",
    "amount",
    "total",
    "shippingCharges",
    "price",
    "cgst",
    "sgst",
    "igst",
    "vat",
    "cess",
    "sal",
    "others",
  ];

  const writeBodyRow = (worksheet, headerObj, reportItem, rowIndex) => {
    Object.entries(headerObj).forEach(([key], fieldIndex) => {
      if (key !== "_id") {
        const value = reportItem[key];
        const cell = worksheet.cell(rowIndex, fieldIndex + 1);

        if (["num", "poNo"].includes(key)) {
          cell.string(String(value ?? ""));
        } else if (
          typeof value === "number" ||
          (typeof value === "string" &&
            value.trim() !== "" &&
            !isNaN(Number(value)))
        ) {
          const numValue = Number(value);
          if (priceFields.includes(key)) {
            cell.number(numValue).style(numberStyle);
          } else {
            cell.number(numValue); // Default formatting for other numbers (e.g. quantity)
          }
        } else {
          cell.string(String(value ?? ""));
        }
      }
    });
  };

  let currentMainRow = 1;
  if (organization) {
    ws.cell(currentMainRow, 1)
      .string(organization.name)
      .style({ font: { bold: true, size: 14 } });
    currentMainRow++;
    ws.cell(currentMainRow, 1).string(organization.address);
    currentMainRow++;
    if (organization.gstNo) {
      ws.cell(currentMainRow, 1).string(`GST No: ${organization.gstNo}`);
      currentMainRow++;
    }
    if (organization.email || organization.telephone) {
      ws.cell(currentMainRow, 1).string(
        `Contact: ${organization.email || ""} ${organization.telephone || ""}`,
      );
      currentMainRow++;
    }
    currentMainRow++; // Spacer
  }

  writeHeader(ws, header, currentMainRow);
  reportItems.forEach((reportItem, index) => {
    writeBodyRow(ws, header, reportItem, currentMainRow + 1 + index);
  });

  // Summary Row for GSTR reports
  if (reportType === "gstr1" || reportType === "gstr2") {
    const summaryRowIndex = currentMainRow + 1 + reportItems.length;
    const totals = reportData.reduce(
      (acc, item) => {
        acc.totalTax += Number(item.totalTax || 0);
        acc.total += Number(item.total || 0);
        acc.shippingCharges += Number(item.shippingCharges || 0);
        acc.grandTotal +=
          Number(item.total || 0) +
          Number(item.totalTax || 0) +
          Number(item.shippingCharges || 0);
        return acc;
      },
      { totalTax: 0, total: 0, shippingCharges: 0, grandTotal: 0 },
    );

    const formatAmount = (value = 0) =>
      (Number(value) / Math.pow(10, decimalDigits)).toFixed(decimalDigits);

    const mergedSummaryStyle = wb.createStyle({
      font: { bold: true },
      border: { top: { style: "thin" } },
      numberFormat: decimalDigits > 0 ? `0.${"0".repeat(decimalDigits)}` : "0",
    });

    Object.keys(header).forEach((key, index) => {
      const cell = ws.cell(summaryRowIndex, index + 1);
      if (index === 0) {
        cell.string("TOTAL").style(mergedSummaryStyle);
      } else if (["totalTax", "total", "shippingCharges", "grandTotal"].includes(key)) {
        cell.number(Number(formatAmount(totals[key]))).style(mergedSummaryStyle);
      }
    });
  }

  if (reportMapper.itemSheet) {
    const itemWs = wb.addWorksheet("Items");
    const { header: itemHeader, bodyMapper: itemBodyMapper } =
      reportMapper.itemSheet;

    let currentItemRow = 1;
    if (organization) {
      itemWs
        .cell(currentItemRow, 1)
        .string(organization.name)
        .style({ font: { bold: true, size: 14 } });
      currentItemRow++;
      itemWs.cell(currentItemRow, 1).string("Item Wise Report");
      currentItemRow += 2;
    }

    writeHeader(itemWs, itemHeader, currentItemRow);

    let currentRow = currentItemRow + 1;
    reportData.forEach((parent) => {
      if (parent.items && Array.isArray(parent.items)) {
        parent.items.forEach((item) => {
          const mappedItem = itemBodyMapper(parent, item, { decimalDigits });
          writeBodyRow(itemWs, itemHeader, mappedItem, currentRow);
          currentRow++;
        });
      }
    });

    // Summary row for Items sheet
    const summaryRowIndex = currentRow;
    const totalItemAmount = reportData.reduce((acc, parent) => {
      return (
        acc +
        (parent.items || []).reduce(
          (sum, item) => sum + Number(item.quantity * item.price || 0),
          0,
        )
      );
    }, 0);

    const formatAmount = (value = 0) =>
      (Number(value) / Math.pow(10, decimalDigits)).toFixed(decimalDigits);

    Object.keys(itemHeader).forEach((key, index) => {
      const cell = itemWs.cell(summaryRowIndex, index + 1);
      if (index === 0) {
        cell.string("TOTAL").style({ font: { bold: true } });
      }
      if (key === "total") {
        cell.number(Number(formatAmount(totalItemAmount))).style({
          font: { bold: true },
          numberFormat: decimalDigits > 0 ? `0.${"0".repeat(decimalDigits)}` : "0",
        });
      }
    });
  }

  const excelBuffer = await wb.writeToBuffer();
  return excelBuffer;
};

exports.getReportForBill = async ({ req, reportType }) => {
  const saleFilterProps = {
    model: Invoice,
    modelName: INVOICES,
  };
  const purchaseFilterProps = {
    model: Purchase,
    modelName: PURCHASE_INVOICES,
  };
  const transactionFilterProps = {
    model: Transaction,
    modelName: TRANSACTIONS,
  };
  const reportTypes = {
    sale: saleFilterProps,
    purchase: purchaseFilterProps,
    gstr1: saleFilterProps,
    gstr2: purchaseFilterProps,
    transactions: transactionFilterProps,
  };
  const paginationProps = reportTypes[reportType];
  if (!paginationProps)
    throw new Error(i18.t("common:common.report_type_not_found"));
  const Model = paginationProps.model;
  const paginationParams = await getPaginationParams({
    query: req.query,
    params: req.params,
    shouldPaginate: false,
    ...paginationProps,
  });
  let query = Model.find(paginationParams.filter)
    .sort({ createdAt: -1 })
    .populate("party");
  switch (reportType) {
    case "transactions":
      query = query.populate("doc");
      break;
    default:
      break;
  }
  return query;
};

const buildDateBoundary = (dateString, isEndOfDay = false, timeZone = "UTC") => {
  if (!dateString || typeof dateString !== "string") return null;

  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return null;

  const date = isEndOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day, 0, 0, 0, 0);

  return dateUtils.toUTC(date, timeZone);
};

exports.getProfitAndLoss = async ({ orgId, startDate, endDate }) => {
  const objectOrgId = new Types.ObjectId(orgId);
  const setting = await settingService.getDisplaySettingForOrg(orgId);
  const timeZone = setting.timeZone || "UTC";

  let dateMatch = {};
  if (startDate && endDate) {
    const normalizedStartDate = buildDateBoundary(startDate, false, timeZone);
    const normalizedEndDate = buildDateBoundary(endDate, true, timeZone);
    if (normalizedStartDate && normalizedEndDate) {
      dateMatch = {
        date: {
          $gte: normalizedStartDate,
          $lte: normalizedEndDate,
        },
      };
    }
  }

  const baseMatch = {
    org: objectOrgId,
    ...dateMatch,
  };

  const revenueAggregator = [
    { $match: baseMatch },
    {
      $group: {
        _id: null,
        total: { $sum: "$total" },
        totalTax: { $sum: "$totalTax" },
        shippingCharges: { $sum: { $ifNull: ["$shippingCharges", 0] } },
        grandTotal: {
          $sum: {
            $add: ["$total", "$totalTax", { $ifNull: ["$shippingCharges", 0] }],
          },
        },
        count: { $sum: 1 },
      },
    },
    { $project: { _id: 0 } },
  ];

  const purchaseAggregator = [
    { $match: baseMatch },
    {
      $group: {
        _id: null,
        total: { $sum: "$total" },
        totalTax: { $sum: "$totalTax" },
        shippingCharges: { $sum: { $ifNull: ["$shippingCharges", 0] } },
        grandTotal: {
          $sum: {
            $add: ["$total", "$totalTax", { $ifNull: ["$shippingCharges", 0] }],
          },
        },
        count: { $sum: 1 },
      },
    },
    { $project: { _id: 0 } },
  ];

  const expenseAggregator = [
    { $match: baseMatch },
    {
      $facet: {
        byCategory: [
          {
            $group: {
              _id: "$category",
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          {
            $lookup: {
              from: "expense_categories",
              localField: "_id",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    name: 1,
                  },
                },
              ],
              as: "categoryInfo",
            },
          },
          {
            $unwind: {
              path: "$categoryInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              total: 1,
              count: 1,
              category: {
                _id: "$_id",
                name: { $ifNull: ["$categoryInfo.name", "Uncategorized"] },
              },
            },
          },
        ],
        totals: [
          {
            $group: {
              _id: null,
              grandTotal: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
            },
          },
        ],
      },
    },
  ];

  const [revenueResult, purchaseResult, expenseResult] = await Promise.all([
    Invoice.aggregate(revenueAggregator),
    Purchase.aggregate(purchaseAggregator),
    Expense.aggregate(expenseAggregator),
  ]);

  const revenue = revenueResult[0] || { total: 0, totalTax: 0, shippingCharges: 0, grandTotal: 0, count: 0 };
  const purchases = purchaseResult[0] || { total: 0, totalTax: 0, shippingCharges: 0, grandTotal: 0, count: 0 };

  const expensesList = expenseResult[0]?.byCategory || [];
  const expensesTotals = expenseResult[0]?.totals?.[0] || { grandTotal: 0, count: 0 };

  const grossProfit = revenue.grandTotal - purchases.grandTotal;
  const netProfit = grossProfit - expensesTotals.grandTotal;

  return {
    revenue,
    purchases,
    grossProfit,
    expenses: {
      byCategory: expensesList,
      grandTotal: expensesTotals.grandTotal,
      count: expensesTotals.count,
    },
    netProfit,
  };
};

exports.makeProfitAndLossExcelBuffer = async ({
  data,
  organization,
  decimalDigits,
  startDate,
  endDate,
}) => {
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet("Profit and Loss");

  const titleStyle = wb.createStyle({
    font: { bold: true, size: 14 },
  });
  const sectionHeaderStyle = wb.createStyle({
    font: { bold: true, size: 12 },
    fill: { type: "pattern", patternType: "solid", fgColor: "F2F2F2" },
  });
  const subtotalStyle = wb.createStyle({
    font: { bold: true },
  });
  const labelStyle = wb.createStyle({
    font: { color: "595959" },
  });
  const numberStyle = wb.createStyle({
    numberFormat: decimalDigits > 0 ? `0.${"0".repeat(decimalDigits)}` : "0",
  });

  const formatAmount = (value = 0) =>
    Number((Number(value || 0) / Math.pow(10, decimalDigits)).toFixed(decimalDigits));

  ws.column(1).setWidth(35);
  ws.column(2).setWidth(15);
  ws.column(3).setWidth(20);

  let row = 1;

  if (organization) {
    ws.cell(row, 1).string(organization.name).style(titleStyle);
    row++;
    ws.cell(row, 1).string("Profit & Loss Statement");
    row++;
    if (startDate && endDate) {
      ws.cell(row, 1).string(`Period: ${startDate} to ${endDate}`);
      row++;
    }
    row++;
  }

  ws.cell(row, 1).string("Details").style(subtotalStyle);
  ws.cell(row, 2).string("Count").style(subtotalStyle);
  ws.cell(row, 3).string("Amount").style(subtotalStyle);
  row++;

  ws.cell(row, 1).string("Revenue (Sales)").style(sectionHeaderStyle);
  ws.cell(row, 2).number(data.revenue.count).style(sectionHeaderStyle);
  ws.cell(row, 3).number(formatAmount(data.revenue.grandTotal)).style(sectionHeaderStyle).style(numberStyle);
  row++;

  ws.cell(row, 1).string("  Subtotal (Before Tax)").style(labelStyle);
  ws.cell(row, 3).number(formatAmount(data.revenue.total)).style(numberStyle);
  row++;

  ws.cell(row, 1).string("  Tax Collected").style(labelStyle);
  ws.cell(row, 3).number(formatAmount(data.revenue.totalTax)).style(numberStyle);
  row++;

  ws.cell(row, 1).string("  Shipping Charges").style(labelStyle);
  ws.cell(row, 3).number(formatAmount(data.revenue.shippingCharges)).style(numberStyle);
  row++;

  row++;

  ws.cell(row, 1).string("Cost of Goods Sold (Purchases)").style(sectionHeaderStyle);
  ws.cell(row, 2).number(data.purchases.count).style(sectionHeaderStyle);
  ws.cell(row, 3).number(formatAmount(data.purchases.grandTotal)).style(sectionHeaderStyle).style(numberStyle);
  row++;

  ws.cell(row, 1).string("  Subtotal (Before Tax)").style(labelStyle);
  ws.cell(row, 3).number(formatAmount(data.purchases.total)).style(numberStyle);
  row++;

  ws.cell(row, 1).string("  Tax Paid").style(labelStyle);
  ws.cell(row, 3).number(formatAmount(data.purchases.totalTax)).style(numberStyle);
  row++;

  ws.cell(row, 1).string("  Shipping Charges").style(labelStyle);
  ws.cell(row, 3).number(formatAmount(data.purchases.shippingCharges)).style(numberStyle);
  row++;

  row++;

  ws.cell(row, 1).string("Gross Profit").style(sectionHeaderStyle);
  ws.cell(row, 3).number(formatAmount(data.grossProfit)).style(sectionHeaderStyle).style(numberStyle);
  row++;

  row++;

  ws.cell(row, 1).string("Expenses").style(sectionHeaderStyle);
  ws.cell(row, 2).number(data.expenses.count).style(sectionHeaderStyle);
  ws.cell(row, 3).number(formatAmount(data.expenses.grandTotal)).style(sectionHeaderStyle).style(numberStyle);
  row++;

  if (data.expenses.byCategory.length > 0) {
    data.expenses.byCategory.forEach((item) => {
      ws.cell(row, 1).string(`  ${item.category?.name || "Uncategorized"}`).style(labelStyle);
      ws.cell(row, 2).number(item.count);
      ws.cell(row, 3).number(formatAmount(item.total)).style(numberStyle);
      row++;
    });
  } else {
    ws.cell(row, 1).string("  No expenses recorded").style(labelStyle);
    row++;
  }

  row++;

  ws.cell(row, 1).string("Net Profit / (Loss)").style(sectionHeaderStyle);
  ws.cell(row, 3).number(formatAmount(data.netProfit)).style(sectionHeaderStyle).style(numberStyle);

  const excelBuffer = await wb.writeToBuffer();
  return excelBuffer;
};

const reportExporters = {
  profitAndLoss: {
    fetchData: async ({ orgId, startDate, endDate }) => exports.getProfitAndLoss({ orgId, startDate, endDate }),
    makeBuffer: async ({ data, organization, decimalDigits, startDate, endDate }) =>
      exports.makeProfitAndLossExcelBuffer({ data, organization, decimalDigits, startDate, endDate }),
  },
  default: {
    fetchData: async ({ req, reportType }) => exports.getReportForBill({ req, reportType }),
    makeBuffer: async ({ data, reportType, organization, decimalDigits }) =>
      exports.makeReportExcelBuffer({ reportData: data, reportType, decimalDigits, organization }),
  },
};

exports.exportReportToExcel = async ({
  req,
  reportType,
  orgId,
  organization,
  decimalDigits,
  startDate,
  endDate,
}) => {
  const exporter = reportExporters[reportType] || reportExporters.default;
  const data = await exporter.fetchData({ req, reportType, orgId, startDate, endDate });
  return exporter.makeBuffer({ data, reportType, organization, decimalDigits, startDate, endDate });
};

