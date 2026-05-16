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

  const writeBodyRow = (worksheet, headerObj, reportItem, rowIndex) => {
    Object.entries(headerObj).forEach(([key], fieldIndex) => {
      if (key !== "_id") {
        const value = reportItem[key];
        const cell = worksheet.cell(rowIndex, fieldIndex + 1);

        if (
          typeof value === "number" ||
          (typeof value === "string" &&
            value.trim() !== "" &&
            !isNaN(Number(value)))
        ) {
          cell.number(Number(value)).style(numberStyle);
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
