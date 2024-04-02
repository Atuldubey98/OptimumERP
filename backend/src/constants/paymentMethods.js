const paymentMethods = [
  { value: "", label: "Default Payment" },
  { value: "card", label: "Credit/Debit Card Payments" },
  { value: "eft", label: "Electronic Funds Transfer (EFT)" },
  { value: "direct_debit", label: "Direct Debit" },
  { value: "bank_transfer", label: "Bank Transfers" },
  { value: "online_wallet", label: "Online Payment Wallets" },
  { value: "mobile", label: "Mobile Payments" },
  { value: "cash", label: "Cash Payments" },
  { value: "cheque", label: "Cheque Payments" },
  { value: "installments", label: "Payment Plans/Installments" },
  {
    value: "ecommerce",
    label: "Payment Integration with E-commerce Platforms",
  },
  { value: "intl_methods", label: "International Payment Methods" },
  { value: "ach", label: "Automated Clearing House (ACH) Payments" },
  { value: "crypto", label: "Cryptocurrency Payments" },
];

module.exports = paymentMethods;
