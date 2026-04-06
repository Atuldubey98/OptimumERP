const borderLandTemplate = (data, color) => {
  const labels = data?.metaLabels || {};
  const dateLocale = data?.dateLocale || "en-IN";
  const palette = {
    text: "#1F2937",
    muted: "#4B5563",
    border: "#374151",
  };

  const taxEntries = Object.entries(data.currencyTaxCategories || {});

  return {
    pageMargins: [30, 30, 30, 30],
    content: [
      {
        text: data.title?.toLocaleUpperCase() || "TAX INVOICE",
        style: "mainTitle",
        alignment: "center",
        margin: [0, 0, 0, 5],
      },
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                table: {
                  widths: ["*", "25%", "25%"],
                  body: [
                    // Header Row: Logo, Name, and Invoice Meta
                    [
                      {
                        columns: [
                          data.entity?.org?.logo ? { image: data.entity.org.logo, width: 45, margin: [0, 5, 5, 0] } : {},
                          {
                            stack: [
                              { text: data.entity?.org?.name, style: "header" },
                              { text: data.entity?.org?.address, style: "companyMeta" },
                              { text: `Phone no.: ${data.entity?.org?.phone || ""}`, style: "companyMeta" },
                              { text: `Email: ${data.entity?.org?.email || ""}`, style: "companyMeta" },
                              { text: `GSTIN: ${data.entity?.org?.gstNo || ""}`, style: "companyMetaStrong" },
                              { text: `State: ${data.entity?.org?.state || ""}`, style: "companyMeta" },
                            ],
                          },
                        ],
                        rowSpan: 3,
                      },
                      {
                        stack: [
                          { text: labels.number || "Invoice No.", style: "metaLabel" },
                          { text: data.num, style: "bodyTextStrong" },
                        ],
                      },
                      {
                        stack: [
                          { text: labels.date || "Date", style: "metaLabel" },
                          { text: new Date(data.entity.date).toLocaleDateString(dateLocale), style: "bodyTextStrong" },
                        ],
                      },
                    ],
                    // Second Meta Row: Place of Supply & PO Date
                    [
                      {},
                      {
                        stack: [
                          { text: labels.place_of_supply || "Place of supply", style: "metaLabel" },
                          { text: data.entity.placeOfSupply || "", style: "bodyTextStrong" },
                        ],
                      },
                      {
                        stack: [
                          { text: labels.po_date || "PO date", style: "metaLabel" },
                          { text: data.entity.poDate ? new Date(data.entity.poDate).toLocaleDateString(dateLocale) : "", style: "bodyTextStrong" },
                        ],
                      },
                    ],
                    // Third Meta Row: PO Number
                    [
                      {},
                      {
                        colSpan: 2,
                        stack: [
                          { text: labels.po_no || "PO number", style: "metaLabel" },
                          { text: data.entity.poNo || "", style: "bodyTextStrong" },
                        ],
                      },
                      {},
                    ],
                    // Bill To Section
                    [
                      {
                        stack: [
                          { text: data.partyMetaHeading || "Bill To", style: "subheader" },
                          { text: data.entity.party.name, style: "partyName" },
                          { text: data.entity.billingAddress, style: "bodyText" },
                          { text: `GSTIN : ${data.entity.party.gstNo || ""}`, style: "bodyText" },
                          { text: `State: ${data.entity.party.state || ""}`, style: "bodyText" },
                        ],
                        margin: [0, 5, 0, 5],
                      },
                      { text: "", colSpan: 2 },
                      {},
                    ],
                  ],
                },
                layout: "headerLayout",
              },
            ],
            // Items Table
            [
              {
                table: {
                  headerRows: 1,
                  widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto", "auto"],
                  body: [
                    [
                      { text: "#", style: "tableHeader" },
                      { text: labels.item || "Item name", style: "tableHeader" },
                      { text: labels.hsn_sac_code || "HSN/ SAC", style: "tableHeader" },
                      { text: labels.qty || "Quantity", style: "tableHeader" },
                      { text: labels.um || "Unit", style: "tableHeader" },
                      { text: labels.rate || "Price/ Unit", style: "tableHeader" },
                      { text: labels.tax || "GST", style: "tableHeader" },
                      { text: labels.amount || "Amount", style: "tableHeader" },
                    ],
                    ...data.items.map((item, index) => [
                      { text: index + 1, alignment: "center" },
                      { text: item.name },
                      { text: item.code, alignment: "center" },
                      { text: item.quantity, alignment: "center" },
                      { text: item.um, alignment: "center" },
                      { text: `₹ ${item.price}`, alignment: "right" },
                      { text: `${item.taxAmount} (${item.gst})`, alignment: "right" },
                      { text: `₹ ${item.total}`, alignment: "right" },
                    ]),
                    [
                      { text: "Total", colSpan: 3, style: "bodyTextStrong", alignment: "left" },
                      {}, {},
                      { text: data.items.reduce((acc, curr) => acc + (curr.quantity || 0), 0), style: "bodyTextStrong", alignment: "center" },
                      { text: "", colSpan: 2 },
                      {},
                      { text: `₹ ${data.totalTaxAmount}`, style: "bodyTextStrong", alignment: "right" },
                      { text: `₹ ${data.total}`, style: "bodyTextStrong", alignment: "right" },
                    ],
                  ],
                },
                layout: "itemsLayout",
              },
            ],
            // Footer/Summary Section
            [
              {
                table: {
                  widths: ["*", "*"],
                  body: [
                    [
                      {
                        stack: [
                          { text: labels.amount_in_words || "Invoice Amount In Words", style: "metaLabel" },
                          { text: data.amountToWords, style: "bodyTextStrong" },
                        ],
                      },
                      {
                        table: {
                          widths: ["*", "auto"],
                          body: [
                            [{ text: "Amounts:", style: "bodyTextStrong", colSpan: 2 }, {}],
                            [{ text: "Sub Total", style: "bodyText" }, { text: `₹ ${data.total}`, alignment: "right" }],
                            [{ text: "Total", style: "bodyTextStrong" }, { text: `₹ ${data.grandTotal}`, alignment: "right", style: "bodyTextStrong" }],
                            [{ text: "Received", style: "bodyText" }, { text: "₹ 0.00", alignment: "right" }],
                            [{ text: "Balance", style: "bodyText" }, { text: `₹ ${data.grandTotal}`, alignment: "right" }],
                          ],
                        },
                        layout: "noBorders",
                      },
                    ],
                  ],
                },
                layout: "footerGrid",
              },
            ],
            // Tax Breakup Table
            [
              {
                table: {
                  widths: ["*", "*", "auto", "auto", "auto", "auto", "auto"],
                  body: [
                    [
                      { text: "HSN/ SAC", style: "tableHeader", alignment: "center" },
                      { text: "Taxable amount", style: "tableHeader", alignment: "center" },
                      { text: "CGST", style: "tableHeader", colSpan: 2, alignment: "center" }, {},
                      { text: "SGST", style: "tableHeader", colSpan: 2, alignment: "center" }, {},
                      { text: "Total Tax Amount", style: "tableHeader", alignment: "center" },
                    ],
                    [
                      "", "",
                      { text: "Rate", style: "tableHeaderSmall" }, { text: "Amount", style: "tableHeaderSmall" },
                      { text: "Rate", style: "tableHeaderSmall" }, { text: "Amount", style: "tableHeaderSmall" },
                      "",
                    ],
                    ...taxEntries.map(([hsn, val]) => [
                      { text: hsn, alignment: "center" },
                      { text: val.taxableAmount, alignment: "right" },
                      { text: val.cgstRate, alignment: "center" }, { text: val.cgstAmount, alignment: "right" },
                      { text: val.sgstRate, alignment: "center" }, { text: val.sgstAmount, alignment: "right" },
                      { text: val.totalTax, alignment: "right" },
                    ]),
                  ],
                },
                layout: "itemsLayout",
              },
            ],
            // Bank and Signature
            [
              {
                table: {
                  widths: ["*", "*"],
                  body: [
                    [
                      {
                        stack: [
                          { text: "Terms and conditions:", style: "bodyTextStrong" },
                          { text: data.entity.terms || "Thanks for doing business with us!", style: "bodyText" },
                        ],
                      },
                      {
                        stack: [
                          { text: "Company's Bank details:", style: "bodyTextStrong" },
                          { text: `Bank Name : ${data.bank?.name || ""}`, style: "bodyText" },
                          { text: `Bank Account No. : ${data.bank?.accountNo || ""}`, style: "bodyText" },
                          { text: `Bank IFSC code : ${data.bank?.ifscCode || ""}`, style: "bodyText" },
                          { text: `Account holder's name : ${data.bank?.accountHolderName || ""}`, style: "bodyText" },
                        ],
                      },
                    ],
                    [
                      {},
                      {
                        stack: [
                          { text: `For, : ${data.entity?.org?.name}`, alignment: "center", margin: [0, 5, 0, 40] },
                          { text: "Authorized Signatory", alignment: "center", style: "bodyText" },
                        ],
                        border: [true, true, false, false],
                      },
                    ],
                  ],
                },
                layout: "footerGrid",
              },
            ],
          ],
        },
        layout: "outerLayout",
      },
    ],
    styles: {
      mainTitle: { fontSize: 10, bold: true, color: palette.text },
      header: { fontSize: 14, bold: true, color: palette.text },
      subheader: { fontSize: 9, color: palette.muted },
      partyName: { fontSize: 10, bold: true },
      companyMeta: { fontSize: 8, color: palette.muted },
      companyMetaStrong: { fontSize: 8, bold: true },
      metaLabel: { fontSize: 8, color: palette.muted },
      bodyText: { fontSize: 8.5 },
      bodyTextStrong: { fontSize: 8.5, bold: true },
      tableHeader: { fontSize: 8.5, bold: true, alignment: "center" },
      tableHeaderSmall: { fontSize: 7, bold: true, alignment: "center" },
    },
    tableLayouts: {
      outerLayout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => palette.border,
        vLineColor: () => palette.border,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
      headerLayout: {
        hLineWidth: (i) => (i > 0 ? 1 : 0),
        vLineWidth: (i) => (i > 0 ? 1 : 0),
        hLineColor: () => palette.border,
        vLineColor: () => palette.border,
        paddingLeft: () => 5,
        paddingRight: () => 5,
      },
      itemsLayout: {
        hLineWidth: () => 1,
        vLineWidth: (i) => (i === 0 || i === 8 ? 0 : 1),
        hLineColor: () => palette.border,
        vLineColor: () => palette.border,
      },
      footerGrid: {
        hLineWidth: (i) => (i === 1 ? 1 : 0),
        vLineWidth: (i) => (i === 1 ? 1 : 0),
        hLineColor: () => palette.border,
        vLineColor: () => palette.border,
      },
    },
  };
};

module.exports = borderLandTemplate;