const { Types } = require("mongoose");
const { z } = require("zod");
const { makeReportExcelBuffer } = require("../../services/report.service");
const billSchema = z.object({
  partyName: z.coerce.number().optional(),
  billingAddress: z.coerce.number().optional(),
  date: z.coerce.number().optional(),
  total: z.coerce.number().optional(),
  totalTax: z.coerce.number().optional(),
  shippingCharges: z.coerce.number().optional(),
  num: z.coerce.number().optional(),
  status: z.coerce.number().optional(),
  createdByName: z.coerce.number().optional(),
  createdByEmail: z.coerce.number().optional(),
  poNo: z.coerce.number().optional(),
  poDate: z.coerce.number().optional(),
  cgst: z.coerce.number().optional(),
  igst: z.coerce.number().optional(),
  sgst: z.coerce.number().optional(),
  vat: z.coerce.number().optional(),
  cess: z.coerce.number().optional(),
  sal: z.coerce.number().optional(),
  others: z.coerce.number().optional(),
  grandTotal: z.coerce.number().optional(),
});

const exportData = async (options = {}, req, res) => {
  const { Bill } = options;
  const exportType = ["excel"].includes(req.params.exportType)
    ? req.params.exportType
    : "excel";
  const project = await billSchema.parseAsync(req.query.select || {});
  const filter = {
    date: {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    },
    org: new Types.ObjectId(req.params.orgId),
  };
  const { getDisplaySettingForOrg } = require("../../services/setting.service");
  const { moneyUtils } = require("../../utils");
  const setting = await getDisplaySettingForOrg(req.params.orgId);
  const currencyConfig = await moneyUtils.getCurrencyConfigByCode(setting.currency);
  const decimalDigits = currencyConfig?.decimal_digits || 2;

  const buffer = await generateBuffer({
    Bill,
    project,
    exportType,
    filter,
    decimalDigits,
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

async function generateBuffer({ Bill, filter, project, exportType, decimalDigits }) {
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
    decimalDigits,
  });
  return buffer;
}

function prepareExcelReport({ bills = [], headerRow, reportType, decimalDigits }) {
  return makeReportExcelBuffer({
    reportData: bills,
    reportType,
    selectedHeaderRows: headerRow,
    isReport: false,
    decimalDigits,
  });
}
function prepareHeader(project = {}) {
  const projectHeaders = {
    partyName: "Party Name",
    billingAddress: "Billing Address",
    date: "Date",
    total: "Total",
    totalTax: "Total Tax",
    shippingCharges: "Shipping Charges",
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
        shippingCharges: 1,
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
        grandTotal: { $add: ["$totalTax", "$total", { $ifNull: ["$shippingCharges", 0] }] },
      },
    },
    {
      $project: project,
    },
  ]);
}
