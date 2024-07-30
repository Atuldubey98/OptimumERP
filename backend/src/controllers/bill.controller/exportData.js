const { Types } = require("mongoose");
const Joi = require("joi");
const { makeReportExcelBuffer } = require("../../services/report.service");
const billSchema = Joi.object({
  partyName: Joi.number().optional(),
  billingAddress: Joi.number().optional(),
  date: Joi.number().optional(),
  total: Joi.number().optional(),
  totalTax: Joi.number().optional(),
  num: Joi.number().optional(),
  status: Joi.number().optional(),
  createdByName: Joi.number().optional(),
  createdByEmail: Joi.number().optional(),
  poNo: Joi.number().optional(),
  poDate: Joi.number().optional(),
  cgst: Joi.number().optional(),
  igst: Joi.number().optional(),
  sgst: Joi.number().optional(),
  vat: Joi.number().optional(),
  cess: Joi.number().optional(),
  sal: Joi.number().optional(),
  others: Joi.number().optional(),
  grandTotal: Joi.number().optional(),
});

const exportData = async (options = {}, req, res) => {
  const { Bill } = options;
  const exportType = ["excel"].includes(req.params.exportType)
    ? req.params.exportType
    : "excel";
  const project = await billSchema.validateAsync(req.query.select);
  const filter = {
    date: {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    },
    org: new Types.ObjectId(req.params.orgId),
  };
  const buffer = await generateBuffer({
    Bill,
    project,
    exportType,
    filter,
  });
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=report-${Bill.modelName}.xlsx `
  );
  res.setHeader("Content-Length", buffer.length);
  return res.send(buffer);
};

module.exports = exportData;

async function generateBuffer({ Bill, filter, project, exportType }) {
  const bills = await makeBillsForExport({
    Bill,
    filter,
    project,
  });
  const exportFunctions = {
    excel: prepareExcelReport,
  };
  const getExportByTypeFunction = exportFunctions[exportType];
  const headers = prepareHeader(project);
  const buffer = await getExportByTypeFunction({
    bills,
    headerRow: headers,
    reportType: Bill.modelName,
  });
  return buffer;
}

function prepareExcelReport({ bills = [], headerRow, reportType }) {
  return makeReportExcelBuffer({
    reportData: bills,
    reportType,
    selectedHeaderRows: headerRow,
    isReport: false,
  });
}
function prepareHeader(project = {}) {
  const projectHeaders = {
    partyName: "Party Name",
    billingAddress: "Billing Address",
    date: "Date",
    total: "Total",
    totalTax: "Total Tax",
    num: "Number",
    status: "Status",
    createdByName: "Created By Name",
    createdByEmail: "Created By Email",
    poNo: "PO Number",
    poDate: "PO Date",
    cgst: "CGST",
    igst: "IGST",
    sgst: "SGST",
    cat: "Category",
    cess: "Cess",
    sal: "SAL",
    others: "Others",
    grandTotal: "Grand Total",
  };
  const headers = Object.keys(project)
    .map((projectKey) => ({
      key: projectKey,
      value: projectHeaders[projectKey],
    }))
    .reduce((prev, current) => {
      prev[current.key] = current.value;
      return prev;
    }, {});
  return headers;
}

function makeBillsForExport({ Bill, filter, project }) {
  return Bill.aggregate([
    {
      $match: filter,
    },
    {
      $lookup: {
        from: "parties",
        localField: "party",
        foreignField: "_id",
        as: "party",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $unwind: "$party",
    },
    {
      $unwind: "$createdBy",
    },
    {
      $project: {
        partyName: "$party.name",
        billingAddress: 1,
        total: 1,
        date : 1,
        totalTax: 1,
        num: 1,
        status: 1,
        createdByName: "$createdBy.name",
        createdByEmail: "$createdBy.email",
        poNo: 1,
        poDate: 1,
        cgst: "$taxCategories.cgst",
        igst: "$taxCategories.igst",
        sgst: "$taxCategories.sgst",
        cat: "$taxCategories.cat",
        cess: "$taxCategories.cess",
        sal: "$taxCategories.sal",
        others: "$taxCategories.others",
        grandTotal: { $add: ["$totalTax", "$total"] },
      },
    },
    {
      $project: project,
    },
  ]);
}
