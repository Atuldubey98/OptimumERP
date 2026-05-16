const smtpTools = [
  {
    type: "function",
    function: {
      name: "send_email",
      description: "Send an email. This tool can be used for general communication or to send specific documents (invoices, quotes, etc.) as PDF attachments. Use 'attachDocument: true' ONLY if the user explicitly asks to 'attach', 'send', or 'email' the document. If document details are provided without 'attachDocument: true', the system will NOT attach the file.",
      parameters: {
        type: "object",
        properties: {
          to: {
            type: "array",
            items: { type: "string" },
            description: "List of recipient email addresses.",
          },
          subject: {
            type: "string",
            description: "Email subject line.",
          },
          body: {
            type: "string",
            description: "Email body content (HTML or plain text).",
          },
          attachDocument: {
            type: "boolean",
            description: "Whether to attach the specified document as a PDF. Set to true only if explicitly requested.",
          },
          type: {
            type: "string",
            enum: [
              "invoice",
              "purchase",
              "proforma_invoice",
              "quotes",
              "purchase_order",
            ],
            description: "The category of the document to attach.",
          },
          billId: {
            type: "string",
            description: "The MongoDB _id of the document to attach.",
          },
          billNumber: {
            type: "string",
            description: "The human-readable number of the document to attach (e.g., 'INV-001').",
          },
          cc: {
            type: "array",
            items: { type: "string" },
            description: "List of CC email addresses.",
          },
          replyToMessageId: {
            type: "string",
            description: "The Message-ID of the email to reply to. Use this to keep the conversation in the same thread.",
          },
        },
        required: ["to", "subject", "body"],
      },
    },
  },
];

module.exports = smtpTools;
