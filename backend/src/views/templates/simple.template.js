const simpleTemplate = (data, color) => {
  const labels = data?.metaLabels || {};
  const dateLocale = data?.dateLocale || "en-IN";
  return {
    content: [
      // Title
      {
        text: data.title.toLocaleUpperCase(),
        style: "mainTitle",
        alignment: "center",
        margin: [0, 10, 0, 10],
      },
      {
        columns: [
          data.entity.org.logo
            ? {
                image: data.entity.org.logo,
                width: 50,
                alignment: "center",
              }
            : {},
          {
            stack: [
              { text: data.entity.org.name, style: "header" },
              { text: data.entity.org.address },
              { text: `${labels.gstin || "GSTIN"}: `, style: "inline" },
              { text: data.entity.org.gstNo },
              { text: `${labels.pan || "PAN"}: `, style: "inline" },
              { text: data.entity.org.panNo },
            ],
            alignment: "right",
          },
        ],
        columnGap: 10,
        alignment: "center",
        margin: [0, 0, 0, 0],
      },
      {
        columns: [
          {
            stack: [
              { text: data.partyMetaHeading, style: "subheader" },
              { text: data.entity.party.name, style: { bold: true } },
              { text: data.entity.billingAddress },
              data.entity.party.gstNo
                ? { text: [`${labels.gstin || "GSTIN"}: `, { text: data.entity.party.gstNo }] }
                : {},
              data.entity.party.panNo
                ? { text: [`${labels.pan || "PAN"}: `, { text: data.entity.party.panNo }] }
                : {},
            ],
          },
          {
            stack: [
              { text: data.billMetaHeading, style: "subheader" },
              {
                text: `${labels.date || "Date"}: ${new Date(data.entity.date).toLocaleDateString(
                  dateLocale,
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  },
                )}`,
              },
              { text: `${labels.number || "Number"}: ${data.num}`, bold: true },
              data.entity.poNo ? { text: `${labels.po_no || "PO No"}: ${data.entity.poNo}` } : {},
              data.entity.poDate
                ? {
                    text: `${labels.po_date || "PO Date"}: ${new Date(
                      data.entity.poDate,
                    ).toLocaleDateString(dateLocale)}`,
                  }
                : {},
            ],
            alignment: "right",
          },
        ],
        margin: [0, 0, 0, 20],
      },

      {
        table: {
          headerRows: 1,
          widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto", "auto"],
          body: [
            [
              { text: labels.serial_no || "Sno.", style: "tableHeader" },
              { text: labels.item || "Item", style: "tableHeader" },
              { text: labels.hsn_sac_code || "HSN/SAC Code", style: "tableHeader" },
              { text: labels.um || "UM", style: "tableHeader" },
              { text: labels.rate || "Rate", style: "tableHeader" },
              { text: labels.qty || "Qty", style: "tableHeader" },
              { text: labels.tax || "Tax", style: "tableHeader" },
              { text: labels.amount || "Amount", style: "tableHeader" },
            ],
            ...data.items.map((item, index) => [
              index + 1,
              item.name,
              { text: item.code, noWrap: true, alignment: "right" },
              item.um,
              { text: item.price, noWrap: true, alignment: "right" },
              { text: item.quantity, noWrap: true, alignment: "right" },
              item.gst,
              { text: item.total, noWrap: true, alignment: "right" },
            ]),
          ],
        },
        layout: {
          fillColor: (rowIndex) => (rowIndex === 0 ? color : null),
        },
      },
      {
        table: {
          widths: ["*", "auto"],
          body: [
            [`${labels.subtotal || "Subtotal"}:`, data.total],
            ...Object.entries(data.currencyTaxCategories).map(
              ([taxName, taxValue]) => [
                `${taxName.toLocaleUpperCase()}:`,
                taxValue,
              ],
            ),
            [`${labels.grand_total || "Grand Total"}:`, data.grandTotal],
            [`${labels.amount_in_words || "Amount in words"}:`, data.amountToWords],
          ],
        },
        margin: [0, 20, 0, 20],
      },
      data.entity.terms
        ? {
            stack: [
              { text: `${labels.terms_and_conditions || "Terms and Conditions"}:`, style: "termsHeading" },
              { text: data.entity.terms, style: "terms" },
            ],
            margin: [0, 0, 0, 20],
          }
        : {},
      data.bank
        ? {
            columns: [
              {
                stack: [
                  { text: `${labels.bank_account_details || "Bank Account Details"}:`, style: "subheader" },
                  { text: `${labels.bank_name || "Bank Name"}: ${data.bank.name}` },
                  { text: `${labels.account_holder || "Account Holder"}: ${data.bank.accountHolderName}` },
                  { text: `${labels.account_number || "Account Number"}: ${data.bank.accountNo}` },
                  { text: `${labels.ifsc_code || "IFSC Code"}: ${data.bank.ifscCode}` },
                ],
              },
              data.upiQr
                ? {
                    stack: [
                      { text: labels.upi_qr_code || "UPI QR Code", style: "subheader" },
                      { image: data.upiQr, width: 100 },
                    ],
                    alignment: "right",
                  }
                : {},
            ],
          }
        : {},
      {
        text: labels.authorized_signatory || "Authorized Signatory",
        style: "signatory",
        alignment: "right",
        margin: [0, 50, 0, 0],
      },
    ],
    styles: {
      header: { fontSize: 14, bold: true, color: color },
      subheader: { fontSize: 10, bold: true, color: color },
      tableHeader: { bold: true, color: "white" },
      termsHeading: { bold: true },
      terms: { italics: true },
      signatory: { bold: true, decoration: "underline" },
      mainTitle: { fontSize: 14, bold: true, color: color },
    },
    defaultStyle: {
      fontSize: 8,
      lineHeight: 1.2,
    },
    pageMargins: [20, 20, 20, 20],
  };
};

module.exports = simpleTemplate;
