const logger = require("../../logger");
const OrgModel = require("../../models/org.model");
const Party = require("../../models/party.model");
const Invoice = require("../../models/invoice.model");
const { getTaxListForOrg } = require("../../services/tax.service");
const { getUmListForOrg } = require("../../services/um.service");
const { saveBill, getNextSequence } = require("../../services/bill.service");
const { executeMongoDbTransaction } = require("../../services/crud.service");
const { create: createParty } = require("../../services/party.service");
const { invoiceDto } = require("../../dto/invoice.dto");
const { InvoiceDuplicate, InvoiceNotFound } = require("../../errors/invoice.error");
const {
  extractPartyFromDocument,
  extractDocumentInfoFromDocument,
  extractProductsFromDocument,
} = require("../../services/ai.service");

const extractInvoice = async (ws, msg, req) => {
  const { docText, orgId } = msg;
  if (!docText || !orgId) {
    return ws.send(
      JSON.stringify({ type: "error", message: "docText and orgId are required" })
    );
  }

  const userId = req.session.user._id;

  const [org, taxes, ums] = await Promise.all([
    OrgModel.findOne({ _id: orgId }).select("name").lean(),
    getTaxListForOrg(orgId),
    getUmListForOrg(orgId),
  ]);

  if (!org) {
    return ws.send(JSON.stringify({ type: "error", message: "Organization not found" }));
  }

  const partyResult = await extractPartyFromDocument(org.name, docText).then(
    (v) => ({ status: "fulfilled", value: v }),
    (e) => ({ status: "rejected", reason: e })
  );
  const docInfoResult = await extractDocumentInfoFromDocument(docText).then(
    (v) => ({ status: "fulfilled", value: v }),
    (e) => ({ status: "rejected", reason: e })
  );
  const productsResult = await extractProductsFromDocument(taxes, ums, docText).then(
    (v) => ({ status: "fulfilled", value: v }),
    (e) => ({ status: "rejected", reason: e })
  );

  const partyInfo = partyResult.status === "fulfilled" ? partyResult.value : null;
  const docInfo = docInfoResult.status === "fulfilled" ? docInfoResult.value : null;
  const productsInfo = productsResult.status === "fulfilled" ? productsResult.value : null;

  if (partyInfo?.name) {
    ws.send(JSON.stringify({ type: "party_identified", party: partyInfo }));
  } else {
    logger.error("Party extraction failed: " + partyResult.reason?.message, partyResult.reason);
    ws.send(JSON.stringify({ type: "party_not_found" }));
  }

  if (docInfo) {
    ws.send(JSON.stringify({ type: "document_info_identified", ...docInfo }));
  } else {
    logger.error("Document info extraction failed: " + docInfoResult.reason?.message, docInfoResult.reason);
  }
 
  if (productsInfo?.products?.length) {
    ws.send(JSON.stringify({ type: "products_identified", products: productsInfo.products }));
  } else {
    logger.error(
      "Products extraction failed: " + (productsResult.reason?.message || productsResult.reason),
      { reason: productsResult.reason, productsInfo, status: productsResult.status }
    );
    ws.send(JSON.stringify({ type: "products_not_found" }));
  }

  // Need at least a party name and products to create an invoice
  if (!partyInfo?.name || !productsInfo?.products?.length) {
    return ws.send(JSON.stringify({ type: "invoice_not_created", reason: "Insufficient data extracted" }));
  }

  try {
    // Find or create party
    let party = await Party.findOne({
      org: orgId,
      name: new RegExp(`^${partyInfo.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    }).lean();

    if (!party) {
      const billingAddress = partyInfo.billingAddress || partyInfo.shippingAddress || partyInfo.name;
      party = await createParty({
        name: partyInfo.name,
        billingAddress: billingAddress.length >= 3 ? billingAddress : `${billingAddress}   `.slice(0, 3),
        shippingAddress: partyInfo.shippingAddress || "",
        gstNo: partyInfo.gstNo || "",
        panNo: partyInfo.panNo || "",
        org: orgId,
        createdBy: userId,
      });
    }

    const sequence = await getNextSequence({ Bill: Invoice, org: orgId, prefixType: "invoice" });

    const items = productsInfo.products.map((p) => ({
      name: p.name,
      price: p.price || 0,
      quantity: p.quantity || 1,
      code: p.code || "",
      ...(p.tax && p.tax !== "null" ? { tax: p.tax } : {}),
      ...(p.um && p.um !== "null" ? { um: p.um } : {}),
    }));

    const requestBody = {
      party: party._id.toString(),
      billingAddress: partyInfo.billingAddress || partyInfo.shippingAddress || party.billingAddress,
      items,
      date: new Date(),
      prefix: "",
      sequence,
      org: orgId,
      createdBy: userId,
      poNo: docInfo?.poNo || "",
      status: "draft",
    };

    let createdBill;
    await executeMongoDbTransaction(async (session) => {
      createdBill = await saveBill({
        Bill: Invoice,
        dto: invoiceDto,
        Duplicate: InvoiceDuplicate,
        NotFound: InvoiceNotFound,
        requestBody,
        prefixType: "invoice",
        session,
      });
      await OrgModel.updateOne(
        { _id: orgId },
        { $inc: { "relatedDocsCount.invoices": 1 } }
      ).session(session);
    });

    ws.send(JSON.stringify({ type: "invoice_created", invoiceId: createdBill._id }));
  } catch (err) {
    logger.error("Invoice creation failed: " + err.message, err);
    ws.send(JSON.stringify({ type: "invoice_creation_failed", reason: err.message }));
  }
};

module.exports = extractInvoice;
