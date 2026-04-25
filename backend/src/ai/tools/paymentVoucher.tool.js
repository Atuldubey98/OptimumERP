const paymentVoucherTools = [
  {
    type: "function",
    function: {
      name: "create_payment_voucher",
      description: "Create a new payment or receipt voucher for a party.",
      parameters: {
        type: "object",
        properties: {
          voucherType: {
            type: "string",
            enum: ["receipt", "payment"],
            description: "Whether it is a receipt (inward) or payment (outward).",
          },
          partyId: {
            type: "string",
            description: "The MongoDB _id of the party.",
          },
          partyName: {
            type: "string",
            description: "The name of the party (to find it if ID is not known).",
          },
          amount: {
            type: "number",
            description: "The amount of the payment.",
          },
          paymentMode: {
            type: "string",
            description: "Method of payment (e.g., card,eft,direct_debit,bank_transfer,online_wallet,mobile,cash,cheque,installments,ecommerce,intl_methods,ach,crypto).",
          },
          date: {
            type: "string",
            description: "The date of the payment (YYYY-MM-DD).",
          },
          description: {
            type: "string",
            description: "Optional remarks or description for the voucher.",
          },
          refDocId: {
            type: "string",
            description: "The MongoDB _id of the linked invoice or purchase.",
          },
          refDocModel: {
            type: "string",
            enum: ["invoice", "purchase"],
            description: "The type of the linked document ('invoice' or 'purchase').",
          },
        },
        required: ["voucherType", "amount", "paymentMode"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "find_payment_voucher",
      description: "Find a payment voucher by its number or details.",
      parameters: {
        type: "object",
        properties: {
          voucherNumber: {
            type: "string",
            description: "The voucher number (e.g., 'PV-1').",
          },
          voucherId: {
            type: "string",
            description: "The MongoDB _id of the voucher.",
          },
        },
      },
    },
  },
];

module.exports = paymentVoucherTools;
