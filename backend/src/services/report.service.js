const xl = require("excel4node");
const reportDataByType = require("../constants/reportDataByType");
const Invoice = require("../models/invoice.model");
const {
  INVOICES,
  PURCHASE_INVOICES,
  TRANSACTIONS,
} = require("../constants/entities");
const Purchase = require("../models/purchase.model");
const Transaction = require("../models/transaction.model");
const { getPaginationParams } = require("./crud.service");

exports.makeReportExcelBuffer = async ({ reportData, reportType }) => {
  const { bodyMapper, header } = reportDataByType[reportType];
  const reportItems = reportData.map(bodyMapper);
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet();
  const headerStyle = wb.createStyle({
    font: {
      bold: true,
    },
    border: {
      outline: true,
    },
  });
  Object.values(header).forEach((value, index) => {
    ws.cell(1, index + 1)
      .string(value)
      .style(headerStyle);
  });
  reportItems.forEach((reportItem, index) => {
    Object.entries(header).forEach(([key], fieldIndex) => {
      if (key != "_id")
        ws.cell(index + 2, fieldIndex + 1).string(reportItem[key]);
    });
  });
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
  if (!paginationProps) throw new Error("Report type not found");
  const Model = paginationProps.model;
  const paginationParams = await getPaginationParams({
    req,
    shouldPaginate: false,
    ...paginationProps,
  });
  let query = Model.find(paginationParams.filter).sort({ createdAt: -1 }).populate("party");
  switch (reportType) {
    case "transactions":
      query = query.populate("doc");
      break;
    default:
      break;
  }
  return query;
};
