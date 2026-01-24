const buzyTemplate = (data, color) => {
  return {
    pageSize: "A4",
    pageMargins: [20, 20, 20, 20],

    content: [
      // Title
      {
        text:
          data && data.title
            ? data.title.toString().toUpperCase()
            : "TAX INVOICE",
        style: "mainTitle",
        alignment: "center",
        margin: [0, 10, 0, 10],
      },

      // Header: left = company, right = invoice meta
      {
        columns: [
          {
            width: "*",
            stack: [
              data && data.entity && data.entity.org && data.entity.org.logo
                ? {
                    image: data.entity.org.logo,
                    width: 60,
                    margin: [0, 0, 0, 6],
                  }
                : {},
              data && data.entity && data.entity.org && data.entity.org.name
                ? { text: data.entity.org.name, style: "header" }
                : {},
              data && data.entity && data.entity.org && data.entity.org.address
                ? { text: data.entity.org.address, style: "inline" }
                : {},
              data && data.entity && data.entity.org && data.entity.org.phone
                ? { text: `Phone: ${data.entity.org.phone}`, style: "inline" }
                : {},
              data && data.entity && data.entity.org && data.entity.org.email
                ? { text: `Email: ${data.entity.org.email}`, style: "inline" }
                : {},
              data && data.entity && data.entity.org && data.entity.org.gstNo
                ? {
                    text: `GSTIN: ${data.entity.org.gstNo}`,
                    style: "inlineBold",
                  }
                : {},
              data &&
              data.entity &&
              data.entity.org &&
              (data.entity.org.stateName || data.entity.org.stateCode)
                ? {
                    text: `State: ${data.entity.org.stateName || ""}${data.entity.org.stateCode ? " (" + data.entity.org.stateCode + ")" : ""}`,
                    style: "inline",
                  }
                : {},
            ],
          },
          {
            width: 220,
            stack: [
              {
                text: (data && data.title ? data.title : "TAX INVOICE")
                  .toString()
                  .toUpperCase(),
                style: "title",
                alignment: "right",
              },
              {
                table: {
                  widths: ["*", "*"],
                  body: [
                    [
                      { text: "Invoice No.", style: "metaLabel" },
                      {
                        text:
                          data && data.num
                            ? data.num
                            : data && data.entity && data.entity.invoiceNo
                              ? data.entity.invoiceNo
                              : "",
                        style: "metaValue",
                      },
                    ],
                    [
                      { text: "Invoice Date", style: "metaLabel" },
                      {
                        text:
                          data && data.entity && data.entity.date
                            ? new Date(data.entity.date).toLocaleDateString(
                                "en-IN",
                              )
                            : "",
                        style: "metaValue",
                      },
                    ],
                    [
                      { text: "PO Number", style: "metaLabel" },
                      {
                        text:
                          data && data.entity && data.entity.poNo
                            ? data.entity.poNo
                            : "",
                        style: "metaValue",
                      },
                    ],
                    [
                      { text: "PO Date", style: "metaLabel" },
                      {
                        text:
                          data && data.entity && data.entity.poDate
                            ? new Date(data.entity.poDate).toLocaleDateString(
                                "en-IN",
                              )
                            : "",
                        style: "metaValue",
                      },
                    ],
                  ],
                },
                layout: "noBorders",
                margin: [0, 8, 0, 0],
              },
            ],
          },
        ],
        columnGap: 10,
      },

      { text: "\n" },

      // Bill To and Billing meta
      {
        columns: [
          {
            width: "*",
            stack: [
              {
                text:
                  data && data.partyMetaHeading
                    ? data.partyMetaHeading
                    : "Bill To",
                style: "subheader",
              },
              data && data.entity && data.entity.party && data.entity.party.name
                ? { text: data.entity.party.name, style: "inlineBold" }
                : {},
              data && data.entity && data.entity.billingAddress
                ? { text: data.entity.billingAddress, style: "inline" }
                : {},
              data &&
              data.entity &&
              data.entity.party &&
              data.entity.party.gstNo
                ? {
                    text: `GSTIN: ${data.entity.party.gstNo}`,
                    style: "inlineBold",
                  }
                : {},
              data &&
              data.entity &&
              data.entity.party &&
              data.entity.party.panNo
                ? { text: `PAN: ${data.entity.party.panNo}`, style: "inline" }
                : {},
            ],
          },
          {
            width: 220,
            stack: [
              {
                text:
                  data && data.billMetaHeading
                    ? data.billMetaHeading
                    : "Invoice Details",
                style: "subheader",
                alignment: "right",
              },
              {
                text: `Date: ${data && data.entity && data.entity.date ? new Date(data.entity.date).toLocaleDateString("en-IN") : ""}`,
                alignment: "right",
              },
              {
                text: `Number: ${data && data.num ? data.num : ""}`,
                bold: true,
                alignment: "right",
              },
              data && data.entity && data.entity.poNo
                ? { text: `PO No: ${data.entity.poNo}`, alignment: "right" }
                : {},
              data && data.entity && data.entity.poDate
                ? {
                    text: `PO Date: ${new Date(data.entity.poDate).toLocaleDateString("en-IN")}`,
                    alignment: "right",
                  }
                : {},
            ],
            alignment: "right",
          },
        ],
        margin: [0, 0, 0, 12],
      },

      // Items table
      { text: "Item Details", style: "sectionHeader" },
      {
        table: {
          headerRows: 1,
          widths: [28, "*", 70, 40, 60, 40, 60, 70],
          body: [
            [
              { text: "Sno.", style: "tableHeader" },
              { text: "Items", style: "tableHeader" },
              { text: "HSN/SAC Code", style: "tableHeader" },
              { text: "UM", style: "tableHeader" },
              { text: "Rate", style: "tableHeader" },
              { text: "Qty", style: "tableHeader" },
              { text: "Tax", style: "tableHeader" },
              { text: "Amount", style: "tableHeader" },
            ],
            ...(data && Array.isArray(data.items) && data.items.length
              ? data.items.map((item, index) => [
                  { text: index + 1, alignment: "center" },
                  { text: item.name || "", alignment: "left" },
                  { text: item.code || "", noWrap: true, alignment: "right" },
                  { text: item.um || "", alignment: "center" },
                  {
                    text: item.price != null ? item.price : "",
                    noWrap: true,
                    alignment: "right",
                  },
                  {
                    text: item.quantity != null ? item.quantity : "",
                    noWrap: true,
                    alignment: "right",
                  },
                  { text: item.gst || "", alignment: "right" },
                  {
                    text: item.total != null ? item.total : "",
                    noWrap: true,
                    alignment: "right",
                  },
                ])
              : [
                  { text: "1", alignment: "center" },
                  { text: "—", alignment: "left" },
                  { text: "", alignment: "right" },
                  { text: "", alignment: "center" },
                  { text: "", alignment: "right" },
                  { text: "", alignment: "right" },
                  { text: "", alignment: "right" },
                  { text: "", alignment: "right" },
                ]),
          ],
        },
        layout: {
          fillColor: function (rowIndex) {
            return rowIndex === 0 ? color || "#4a4a4a" : null;
          },
        },
      },

      // Totals and tax breakdown (right aligned)
      {
        columns: [
          { width: "*", text: "" },
          {
            width: 260,
            table: {
              widths: ["*", "auto"],
              body: [
                [
                  { text: "Subtotal:", bold: true },
                  {
                    text: data && data.total != null ? data.total : "₹ 0.00",
                    alignment: "right",
                  },
                ],
                ...(data &&
                data.currencyTaxCategories &&
                Object.keys(data.currencyTaxCategories).length
                  ? Object.entries(data.currencyTaxCategories).map(
                      ([taxName, taxValue]) => [
                        { text: `${taxName.toString().toUpperCase()}:` },
                        { text: taxValue, alignment: "right" },
                      ],
                    )
                  : []),
                [
                  { text: "Grand Total:", bold: true },
                  {
                    text:
                      data && data.grandTotal != null
                        ? data.grandTotal
                        : "₹ 0.00",
                    alignment: "right",
                  },
                ],
                [
                  { text: "Amount in words:", bold: true },
                  {
                    text: data && data.amountToWords ? data.amountToWords : "",
                    alignment: "right",
                  },
                ],
              ],
            },
            layout: "lightHorizontalLines",
            margin: [0, 12, 0, 12],
          },
        ],
      },

      // Terms and Bank details
      {
        columns: [
          {
            width: "*",
            stack: [
              data && data.entity && data.entity.terms
                ? { text: "Terms and conditions", style: "sectionHeader" }
                : {},
              data && data.entity && data.entity.terms
                ? { text: data.entity.terms, style: "inline" }
                : {},
            ],
          },
          {
            width: 260,
            stack: [
              data && data.bank
                ? { text: "Company Bank details", style: "sectionHeader" }
                : {},
              data && data.bank
                ? {
                    table: {
                      widths: ["*", "*"],
                      body: [
                        ["Bank Name", data.bank.name || ""],
                        ["Bank Account No.", data.bank.accountNo || ""],
                        ["Bank IFSC code", data.bank.ifscCode || ""],
                        [
                          "Account holder name",
                          data.bank.accountHolderName || "",
                        ],
                      ],
                    },
                    layout: "noBorders",
                  }
                : {},
            ],
          },
        ],
        margin: [0, 8, 0, 8],
      },

      // Authorized Signatory (kept generic, no personal signature lines)
      {
        columns: [
          { width: "*", text: "" },
          {
            table: {
              widths: ["*", 200],
              dontBreakRows: true,
              body: [
                [
                  { text: "" },
                  {
                    pageBreak: "avoid",
                    stack: [
                      {
                        text: `For, ${data && data.entity && data.entity.org && data.entity.org.name ? data.entity.org.name : ""}`,
                        style: "inlineBold",
                        alignment: "center",
                        margin: [0, 0, 0, 24],
                      },
                      {
                        text: "Authorized Signatory",
                        style: "inlineBold",
                        alignment: "center",
                      },
                    ],
                  },
                ],
              ],
            },
            layout: "noBorders",
            margin: [0, 12, 0, 0],
          },
        ],
        margin: [0, 12, 0, 0],
      },
    ],

    styles: {
      mainTitle: { fontSize: 14, bold: true, color: color || "#000" },
      title: { fontSize: 16, bold: true, color: color || "#000" },
      header: { fontSize: 12, bold: true, color: "#000" },
      subheader: { fontSize: 11, bold: true, color: color || "#333" },
      sectionHeader: {
        fontSize: 12,
        bold: true,
        margin: [0, 6, 0, 6],
        color: "#333",
      },
      inline: { fontSize: 9, margin: [0, 2, 0, 2] },
      inlineBold: { fontSize: 9, bold: true, margin: [0, 2, 0, 2] },
      tableHeader: { bold: true, color: "white", fontSize: 10 },
      metaLabel: { fontSize: 9, color: "#555" },
      metaValue: { fontSize: 9, bold: true },
    },

    defaultStyle: {
      fontSize: 9,
      columnGap: 10,
    },
  };
};

module.exports = buzyTemplate;
