const simpleTemplate = (data, color) => {
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
              { text: "GSTIN: ", style: "inline" },
              { text: data.entity.org.gstNo },
              { text: "PAN: ", style: "inline" },
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
                ? { text: ["GSTIN: ", { text: data.entity.party.gstNo }] }
                : {},
              data.entity.party.panNo
                ? { text: ["PAN: ", { text: data.entity.party.panNo }] }
                : {},
            ],
          },
          {
            stack: [
              { text: data.billMetaHeading, style: "subheader" },
              {
                text: `Date: ${new Date(data.entity.date).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  },
                )}`,
              },
              { text: `Number: ${data.num}`, bold: true },
              data.entity.poNo ? { text: `PO No: ${data.entity.poNo}` } : {},
              data.entity.poDate
                ? {
                    text: `PO Date: ${new Date(
                      data.entity.poDate,
                    ).toDateString()}`,
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
              { text: "Sno.", style: "tableHeader" },
              { text: "Item", style: "tableHeader" },
              { text: "HSN/SAC Code", style: "tableHeader" },
              { text: "UM", style: "tableHeader" },
              { text: "Rate", style: "tableHeader" },
              { text: "Qty", style: "tableHeader" },
              { text: "Tax", style: "tableHeader" },
              { text: "Amount", style: "tableHeader" },
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
            ["Subtotal:", data.total],
            ...Object.entries(data.currencyTaxCategories).map(
              ([taxName, taxValue]) => [
                `${taxName.toLocaleUpperCase()}:`,
                taxValue,
              ],
            ),
            ["Grand Total:", data.grandTotal],
            ["Amount in words:", data.amountToWords],
          ],
        },
        margin: [0, 20, 0, 20],
      },
      data.entity.terms
        ? {
            stack: [
              { text: "Terms and Conditions:", style: "termsHeading" },
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
                  { text: "Bank Account Details:", style: "subheader" },
                  { text: `Bank Name: ${data.bank.name}` },
                  { text: `Account Holder: ${data.bank.accountHolderName}` },
                  { text: `Account Number: ${data.bank.accountNo}` },
                  { text: `IFSC Code: ${data.bank.ifscCode}` },
                ],
              },
              data.upiQr
                ? {
                    stack: [
                      { text: "UPI QR Code", style: "subheader" },
                      { image: data.upiQr, width: 100 },
                    ],
                    alignment: "right",
                  }
                : {},
            ],
          }
        : {},
      {
        text: "Authorized Signatory",
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
