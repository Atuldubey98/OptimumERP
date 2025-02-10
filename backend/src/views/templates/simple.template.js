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
              { text: `GSTIN: ${data.entity.org.gstNo}` },
              { text: `PAN: ${data.entity.org.panNo}` },
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
              { text: data.entity.party.name },
              { text: data.entity.billingAddress },
              data.entity.party.gstNo
                ? { text: `GSTIN: ${data.entity.party.gstNo}` }
                : {},
              data.entity.party.panNo
                ? { text: `PAN: ${data.entity.party.panNo}` }
                : {},
            ],
          },
          {
            stack: [
              { text: data.billMetaHeading, style: "subheader" },
              { text: `Date: ${new Date(data.entity.date).toDateString()}` },
              { text: `Number: ${data.num}` },
              data.entity.poNo ? { text: `PO No: ${data.entity.poNo}` } : {},
              data.entity.poDate
                ? {
                    text: `PO Date: ${new Date(
                      data.entity.poDate
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
              { text: "Line no.", style: "tableHeader" },
              { text: "Item", style: "tableHeader" },
              { text: "UM", style: "tableHeader" },
              { text: "HSN/SAC Code", style: "tableHeader" },
              { text: "Tax", style: "tableHeader" },
              { text: "Qty", style: "tableHeader" },
              { text: "Rate", style: "tableHeader" },
              { text: "Amount", style: "tableHeader" },
            ],
            ...data.items.map((item, index) => [
              index + 1,
              item.name,
              item.um,
              { text: item.code, noWrap: true }, // Prevent wrapping in Code column
              item.gst,
              { text: item.quantity, noWrap: true }, // Prevent wrapping in Quantity column
              { text: item.price, noWrap: true }, // Prevent wrapping in Price column
              { text: item.total, noWrap: true }, // Prevent wrapping in Amount column
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
            ["SGST:", data.sgst],
            ["CGST:", data.cgst],
            ["IGST:", data.igst],
            ["Grand Total:", data.grandTotal],
            ["Amount in words:", data.amountToWords],
          ],
        },
        margin: [0, 20, 0, 20],
      },
      data.entity.terms
        ? {
            text: `Terms and Conditions:\n${data.entity.terms}`,
            style: "terms",
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
      header: { fontSize: 18, bold: true, color: color },
      subheader: { fontSize: 14, bold: true, color: color },
      tableHeader: { bold: true, fontSize: 12, color: "white" },
      terms: { italics: true },
      signatory: { bold: true, decoration: "underline" },
      mainTitle: { fontSize: 18, bold: true, color: color },
    },
    defaultStyle: {
      fontSize: 10,
      lineHeight: 1.2,
    },
  };
};

module.exports = simpleTemplate;
