const Invoice = require("../models/invoice.model");
const Transaction = require("../models/transaction.model");
const Purchase = require("../models/purchase.model");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const xl = require("excel4node");
function generateReportByReportType(reportType) {
  const reportMap = {
    sale: getSaleReport,
    purchase: getPurchaseReport,
    transactions: getTransactions,
    gstr1: getGSTR1Report,
    gstr2: getGSTR2Report,
  };
  return reportMap[reportType];
}
async function getSaleReport(queryParams, orgId) {
  const filter = {
    org: orgId,
  };
  const search = queryParams.search;
  if (search) {
    filter.$text = { $search: search };
  }

  if (queryParams.startDate && queryParams.endDate) {
    filter.date = {
      $gte: new Date(queryParams.startDate),
      $lte: new Date(queryParams.endDate),
    };
  }

  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;

  const invoices = await Invoice.find(filter)
    .sort({ createdAt: -1 })
    .populate("party")
    .populate("org")
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await Invoice.countDocuments(filter);

  const totalPages = Math.ceil(total / limit);
  return {
    totalPages,
    total,
    data: invoices,
    page,
    skip,
    limit,
  };
}
async function getTransactions(queryParams, orgId) {
  const filter = {
    org: orgId,
  };

  if (queryParams.startDate && queryParams.endDate) {
    filter.date = {
      $gte: new Date(queryParams.startDate),
      $lte: new Date(queryParams.endDate),
    };
  }
  if (queryParams.type) filter.docModel = queryParams.type;
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;
  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .populate("doc")
    .populate("party", "name")
    .skip(skip)
    .limit(limit)
    .exec();
  const total = await Transaction.countDocuments(filter);

  const totalPages = Math.ceil(total / limit);
  return {
    data: transactions,
    page,
    limit,
    totalPages,
    total,
    message: "Transactions retrieved successfully",
  };
}

async function getGSTR1Report(queryParams, orgId) {
  const filter = {
    org: orgId,
  };
  if (queryParams.startDate && queryParams.endDate) {
    filter.date = {
      $gte: new Date(queryParams.startDate),
      $lte: new Date(queryParams.endDate),
    };
  }
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;
  const invoices = await Invoice.find(filter)
    .sort({ createdAt: -1 })
    .populate("party")
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await Invoice.countDocuments(filter);

  const totalPages = Math.ceil(total / limit);
  return {
    data: invoices,
    page,
    limit,
    totalPages,
    total,
    message: "GSTR1 retrieved successfully",
  };
}
async function getGSTR2Report(queryParams, orgId) {
  const filter = {
    org: orgId,
  };
  if (queryParams.startDate && queryParams.endDate) {
    filter.date = {
      $gte: new Date(queryParams.startDate),
      $lte: new Date(queryParams.endDate),
    };
  }
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;
  const purchases = await Purchase.find(filter)
    .sort({ createdAt: -1 })
    .populate("party")
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await Purchase.countDocuments(filter);

  const totalPages = Math.ceil(total / limit);
  return {
    data: purchases,
    page,
    limit,
    totalPages,
    total,
    message: "GSTR2 retrieved successfully",
  };
}
async function getPurchaseReport(queryParams, orgId) {
  const filter = {
    org: orgId,
  };
  const search = queryParams.search;
  if (search) {
    filter.$text = { $search: search };
  }

  if (queryParams.startDate && queryParams.endDate) {
    filter.date = {
      $gte: new Date(queryParams.startDate),
      $lte: new Date(queryParams.endDate),
    };
  }

  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;
  const purchases = await Purchase.find(filter)
    .sort({ createdAt: -1 })
    .populate("party")
    .populate("org")
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await Purchase.countDocuments(filter);

  const totalPages = Math.ceil(total / limit);
  return {
    data: purchases,
    page,
    limit,
    totalPages,
    total,
    message: "Purchases retrieved successfully",
  };
}
exports.getReportByType = requestAsyncHandler(async (req, res) => {
  const reportType = req.params.reportType;
  const orgId = req.params.orgId;
  const reportFn = generateReportByReportType(reportType);
  if (!reportFn) throw new Error("Report type not found");
  const response = await reportFn(req.query, orgId);
  return res.status(200).json(response);
});
const reportDataByType = {
  sale: {
    header: {
      num: "Invoice Number",
      partyName: "Party Name",
      address: "Party Address",
      date: "Date",
      totalTax: "Total Tax",
      poNo: "Purchase Order Number",
      poDate: "Purchase Order Date",
      grandTotal: "Grand Total",
      status: "Status",
    },
    bodyMapper: (item) => ({
      _id: item._id,
      partyName: item.party?.name,
      address: item.party?.billingAddress,
      poNo: item.poNo,
      poDate: item.poDate ? new Date(item.poDate).toLocaleDateString() : "",
      num: item.num,
      date: new Date(item.date).toLocaleDateString(),
      totalTax: item.totalTax.toFixed(2),
      grandTotal: (item.totalTax + item.total).toFixed(2),
      status: (item?.status || "").toLocaleUpperCase(),
    }),
  },
  purchase: {
    header: {
      num: "Purchase Number",
      partyName: "Party Name",
      date: "Date",
      totalTax: "Total Tax",
      grandTotal: "Grand Total",
      status: "Status",
    },

    bodyMapper: (item) => ({
      _id: item._id,
      partyName: item.party?.name,
      num: item.purchaseNo,
      date: new Date(item.date).toLocaleDateString(),
      totalTax: item.totalTax.toFixed(2),
      grandTotal: (item.totalTax + item.total).toFixed(2),
      status: (item?.status || "").toLocaleUpperCase(),
    }),
  },
  transactions: {
    header: {
      type: "Type",
      amount: "Amount",
      relatedTo: "Related To",
      createdAt: "Done at",
      num: "Num",
    },
    bodyMapper: (item) => ({
      _id: item._id,
      num: item.doc?.num || item.doc?.purchaseNo || "",
      type: item?.docModel,
      relatedTo: item?.party?.name || item.doc?.description || "",
      amount: (item.total + item.totalTax).toFixed(2),
      createdAt: new Date(item.createdAt).toISOString().split("T")[0],
    }),
  },
  gstr1: {
    header: {
      gstNo: "Party GST No",
      partyName: "Party Name",
      date: "Invoice Date",
      num: "Invoice No.",
      cgst: "CGST",
      sgst: "SGST",
      igst: "IGST",
      grandTotal: "Grand Total",
    },
    bodyMapper: (item) => ({
      _id: item._id,
      partyName: item.party?.name,
      num: item.num,
      date: new Date(item.date).toLocaleDateString(),
      gstNo: item.party?.gstNo,
      cgst: item.cgst.toFixed(2),
      sgst: item.sgst.toFixed(2),
      igst: item.igst.toFixed(2),
      grandTotal: (item?.total + item?.totalTax).toFixed(2),
    }),
  },
  gstr2: {
    header: {
      gstNo: "Party GST No",
      partyName: "Party Name",
      purchaseNo: "Invoice no",
      date: "Purchase Date",
      cgst: "IGST",
      sgst: "IGST",
      igst: "IGST",
      grandTotal: "Grand Total",
    },
    bodyMapper: (item) => ({
      _id: item._id,
      partyName: item.party?.name,
      purchaseNo: item.purchaseNo,
      gstNo: item.party?.gstNo,
      date: new Date(item.date).toLocaleDateString(),
      cgst: item.cgst.toFixed(2),
      sgst: item.sgst.toFixed(2),
      igst: item.igst.toFixed(2),
      grandTotal: (item?.total + item?.totalTax).toFixed(2),
    }),
  },
};
function getDownloadReportFn(reportType) {
  const reportTypes = {
    sale: downloadSaleReport,
    purchase: downloadPurchaseReport,
    gstr1: downloadSaleReport,
    gstr2: downloadPurchaseReport,
    transactions: downloadTransactionsReport,
  };
  return reportTypes[reportType];
}

async function downloadSaleReport(queryParams, orgId) {
  const filter = {
    org: orgId,
  };
  const search = queryParams.search;
  if (search) {
    filter.$text = { $search: search };
  }

  if (queryParams.startDate && queryParams.endDate) {
    filter.date = {
      $gte: new Date(queryParams.startDate),
      $lte: new Date(queryParams.endDate),
    };
  }
  const invoices = await Invoice.find(filter)
    .sort({ createdAt: -1 })
    .populate("party")
    .exec();
  return invoices;
}
async function downloadPurchaseReport(queryParams, orgId) {
  const filter = {
    org: orgId,
  };
  const search = queryParams.search;
  if (search) {
    filter.$text = { $search: search };
  }

  if (queryParams.startDate && queryParams.endDate) {
    filter.date = {
      $gte: new Date(queryParams.startDate),
      $lte: new Date(queryParams.endDate),
    };
  }
  const purchases = await Purchase.find(filter)
    .sort({ createdAt: -1 })
    .populate("party");
  return purchases;
}

async function downloadTransactionsReport(queryParams, orgId) {
  const filter = {
    org: orgId,
  };

  if (queryParams.startDate && queryParams.endDate) {
    filter.date = {
      $gte: new Date(queryParams.startDate),
      $lte: new Date(queryParams.endDate),
    };
  }
  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .populate("doc")
    .populate("party");
  return transactions;
}

exports.downloadReportByType = requestAsyncHandler(async (req, res) => {
  const reportType = req.params.reportType;
  const orgId = req.params.orgId;
  const reportFn = getDownloadReportFn(reportType);
  if (!reportFn) throw new Error("Report type not found");
  const reports = await reportFn(req.query, orgId);
  const reportMapper = reportDataByType[reportType];
  const reportToDownload = reports.map(reportMapper.bodyMapper);
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
  Object.values(reportMapper.header).forEach((value, index) => {
    const col = index + 1;
    ws.cell(1, col).string(value).style(headerStyle);
  });
  reportToDownload.forEach((reportItem, index) => {
    Object.entries(reportMapper.header).forEach(([key], fieldIndex) => {
      const row = index + 2;
      const col = fieldIndex + 1;
      if (key != "_id") {
        ws.cell(row, col).string(reportItem[key]);
      }
    });
  });
  const excelBuffer = await wb.writeToBuffer();

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=report-${reportType}-${Date.now()}.xlsx`
  );
  res.setHeader("Content-Length", excelBuffer.length);

  res.send(excelBuffer);
});
