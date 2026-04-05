const extractInvoice = require("./handlers/extractInvoice");

const handlers = {
  extract_invoice: extractInvoice,
};

const router = async (ws, msg, req) => {
  const handler = handlers[msg.type];
  if (!handler) {
    return ws.send(JSON.stringify({ type: "error", message: `Unknown type: ${msg.type}` }));
  }
  await handler(ws, msg, req);
};

module.exports = router;
