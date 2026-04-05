const { OpenAI } = require("openai");
const logger = require("../logger");

const AI_BASE_URL = "http://172.26.240.1:1234/v1";
const AI_MODEL = "qwen/qwen3-vl-4b";
const DOC_TEXT_MAX_CHARS = 700;
const PRODUCTS_MAX_CHARS = 1500;

const client = new OpenAI({ baseURL: AI_BASE_URL, apiKey: "" });

const truncate = (text, limit = DOC_TEXT_MAX_CHARS) =>
  text.length > limit ? text.slice(0, limit) : text;

async function callAI(userContent) {
  const completion = await client.chat.completions.create({
    model: AI_MODEL,
    temperature: 0,
    messages: [
      { role: "system", content: "Return JSON only. /no_think" },
      { role: "user", content: userContent },
    ],
  });
  let raw = completion.choices[0].message.content;
  logger.debug(`AI raw response: ${raw}`);
  // Strip think blocks and code fences if model still emits them
  raw = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(raw);
}

function extractPartyFromDocument(orgName, docText) {
  return callAI(
    `Doc:\n${truncate(docText)}\n\nFind counterparty (not "${orgName}"). JSON: {"name":"","shippingAddress":"","billingAddress":"","gstNo":"","panNo":""}`
  );
}

function extractDocumentInfoFromDocument(docText) {
  return callAI(
    `Doc:\n${truncate(docText)}\n\nFind the PO number or any document/reference number, and the document date. JSON: {"poNo":"","date":"ISO date or null"}`
  );
}

function matchTax(taxes, taxHint) {
  if (!taxHint) return null;

  // Split compound strings like "CGST 18%, SGST 18%, IGST 0%, CESS 0%"
  const segments = taxHint.split(",").map((s) => s.trim()).filter(Boolean);

  const candidates = [];
  for (const segment of segments) {
    const hint = segment.toLowerCase();
    // Skip explicitly zero-% segments
    if (/\b0\s*%/.test(hint)) continue;
    // Exact name match
    const byExact = taxes.find((t) => t.name.toLowerCase() === hint);
    if (byExact) { candidates.push(byExact); continue; }
    // Name contained in hint
    const byName = taxes.find((t) => hint.includes(t.name.toLowerCase()));
    if (byName) { candidates.push(byName); continue; }
    // Percentage match
    const pctMatch = hint.match(/(\d+(?:\.\d+)?)\s*%/);
    if (pctMatch) {
      const pct = parseFloat(pctMatch[1]);
      if (pct > 0) {
        const byPct = taxes.find((t) => t.percentage === pct);
        if (byPct) candidates.push(byPct);
      }
    }
  }

  if (!candidates.length) return null;
  // Prefer grouped taxes (covers CGST+SGST together), else highest percentage
  const grouped = taxes.find(
    (t) => t.type === "grouped" &&
      candidates.every((c) => t.children?.some((ch) => ch.toString() === c._id.toString()))
  );
  if (grouped) return grouped._id;
  // Return the candidate with highest percentage
  candidates.sort((a, b) => b.percentage - a.percentage);
  return candidates[0]._id;
}

function matchUm(ums, umHint) {
  if (!umHint) return null;
  const hint = umHint.toLowerCase().trim();
  // Exact unit match
  const byExact = ums.find((u) => u.unit.toLowerCase() === hint);
  if (byExact) return byExact._id;
  // Exact name match
  const byName = ums.find((u) => u.name.toLowerCase() === hint);
  if (byName) return byName._id;
  // hint is a word-boundary match of the unit (avoid "pcs" matching "specifications")
  const byUnit = ums.find((u) => {
    const unit = u.unit.toLowerCase();
    const re = new RegExp(`\\b${unit}\\b`);
    return re.test(hint);
  });
  return byUnit ? byUnit._id : null;
}

async function extractProductsFromDocument(taxes, ums, docText) {
  const truncated = truncate(docText, PRODUCTS_MAX_CHARS);
  logger.debug(`Products doc input (${truncated.length} chars): ${truncated}`);
  const result = await callAI(
    `Doc:\n${truncated}\n\nList all products/line items. JSON: {"products":[{"name":"","price":0,"code":"","quantity":0,"tax":"tax name or %","um":"unit abbreviation"}]}`
  );
  logger.info(`Products AI result: ${JSON.stringify(result)}`);
  const products = (result.products || []).map((p) => {
    const tax = matchTax(taxes, p.tax);
    const um = matchUm(ums, p.um);
    logger.debug(`Tax hint="${p.tax}" → ${tax} | UM hint="${p.um}" → ${um}`);
    logger.debug(`Available taxes: ${taxes.map((t) => `${t.name}(${t.percentage}%)`).join(", ")}`);
    logger.debug(`Available ums: ${ums.map((u) => u.unit).join(", ")}`);
    return {
      name: p.name,
      price: p.price || 0,
      code: p.code || "",
      quantity: p.quantity || 1,
      tax,
      um,
    };
  });
  return { products };
}

module.exports = { extractPartyFromDocument, extractDocumentInfoFromDocument, extractProductsFromDocument };

