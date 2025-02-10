const borderLandTemplate = (data, color) => {
  return {
    content: [
      // Company Header
      {
        columns: [
          data.entity.org.logo
            ? { image: data.entity.org.logo, width: 80, margin: [0, 0, 20, 0] }
            : {},
          {
            stack: [
              { text: data.entity.org.name, style: "headerTitle" },
              { text: data.entity.org.address, style: "headerSub" },
              { text: `GST NO: ${data.entity.org.gstNo}`, style: "headerSub" },
              { text: `PAN NO: ${data.entity.org.panNo}`, style: "headerSub" },
            ],
            alignment: "right",
          },
        ],
        margin: [0, 0, 0, 10],
      },

      // Title
      {
        text: data.title.toLocaleUpperCase(),
        style: "mainTitle",
        alignment: "center",
        margin: [0, 10, 0, 10],
      },

      // Party & Invoice Details
      {
        columns: [
          {
            stack: [
              { text: data.partyMetaHeading, style: "subHeader" },
              { text: data.entity.party.name },
              { text: data.entity.billingAddress },
              data.entity.party.gstNo && {
                text: `GST NO: ${data.entity.party.gstNo}`,
              },
              data.entity.party.panNo && {
                text: `PAN NO: ${data.entity.party.panNo}`,
              },
            ].filter(Boolean),
          },
          {
            stack: [
              { text: data.billMetaHeading, style: "subHeader" },
              {
                text: `Date: ${new Date(
                  data.entity.date
                ).toLocaleDateString()}`,
              },
              { text: `Order No: ${data.num}` },
              data.entity.poNo && { text: `PO No: ${data.entity.poNo}` },
              data.entity.poDate && {
                text: `PO Date: ${new Date(
                  data.entity.poDate
                ).toLocaleDateString()}`,
              },
            ].filter(Boolean),
            alignment: "right",
          },
        ],
        margin: [0, 10, 0, 20],
      },

      // Item Table
      {
        table: {
          headerRows: 1,
          widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto", "auto"],
          body: [
            [
              { text: "S.No", style: "tableHeader" },
              { text: "Item Description", style: "tableHeader" },
              { text: "HSN/SAC", style: "tableHeader" },
              { text: "UM", style: "tableHeader" },
              { text: "Qty", style: "tableHeader" },
              { text: "Rate", style: "tableHeader" },
              { text: "Tax", style: "tableHeader" },
              { text: "Amount", style: "tableHeader" },
            ],
            ...data.items.map((item, index) => [
              index + 1,
              item.name,
              item.code,
              item.um,
              item.quantity,
              item.price,
              item.gst,
              item.total,
            ]),
          ],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          fillColor: (rowIndex) =>
            rowIndex === 0 ? color : rowIndex % 2 === 0 ? "#f9f9f9" : null,
        },
      },

      // Summary Section
      {
        table: {
          widths: ["*", "auto"],
          body: [
            ["Gross Amount", data.total],
            ["SGST", data.sgst],
            ["CGST", data.cgst],
            ["IGST", data.igst],
            [
              {
                text: "Grand Total",
                bold: true,
                fillColor: color,
                color: "white",
              },
              {
                text: data.grandTotal,
                bold: true,
                fillColor: color,
                color: "white",
              },
            ],
            [
              {
                text: "Amount in Words",
                colSpan: 2,
                italics: true,
                fillColor: "#f0f0f0",
              },
              {},
            ],
            [{ text: data.amountToWords, colSpan: 2 }, {}],
          ],
        },
        margin: [0, 20, 0, 20],
      },

      // Terms & Conditions
      data.entity.terms && {
        text: `TERMS AND CONDITIONS:\n${data.entity.terms}`,
        style: "terms",
        margin: [0, 0, 0, 20],
      },

      // Footer
      {
        text: "(Authorised Signatory)",
        style: "footerSignatory",
        alignment: "right",
        margin: [0, 30, 0, 0],
      },
    ],

    styles: {
      headerTitle: { fontSize: 16, bold: true },
      headerSub: { fontSize: 10, color: "#444" },
      mainTitle: { fontSize: 18, bold: true, color: color },
      subHeader: { fontSize: 12, bold: true, margin: [0, 5, 0, 5] },
      tableHeader: {
        bold: true,
        fontSize: 11,
        fillColor: color,
        color: "white",
      },
      terms: { fontSize: 9, italics: true, color: "#666" },
      footerSignatory: { bold: true, decoration: "underline", fontSize: 12 },
    },

    defaultStyle: {
      fontSize: 10,
    },
  };
};
module.exports = borderLandTemplate;
