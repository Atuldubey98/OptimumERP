const buzyTemplate = (data, color) => {
  const labels = data?.metaLabels || {};
  const dateLocale = data?.dateLocale || "en-IN";
  const palette = {
    accent: color || "#1F4E79",
    accentSoft: "#EEF4F8",
    text: "#1F2937",
    muted: "#6B7280",
    border: "#D6DEE8",
    surface: "#F8FAFC",
  };
  const taxEntries =
    data && data.currencyTaxCategories && Object.keys(data.currencyTaxCategories).length
      ? Object.entries(data.currencyTaxCategories)
      : [];

  return {
    pageSize: "A4",
    pageMargins: [24, 24, 24, 30],
    footer: (currentPage, pageCount) => ({
      margin: [24, 0, 24, 10],
      columns: [
        {
          text: data && data.entity && data.entity.org && data.entity.org.name ? data.entity.org.name : "",
          color: palette.muted,
          fontSize: 6.3,
        },
        {
          text: `${currentPage} / ${pageCount}`,
          alignment: "right",
          color: palette.muted,
          fontSize: 6.3,
        },
      ],
    }),

    content: [
      // Title
      {
        text:
          data && data.title
            ? data.title.toString().toUpperCase()
            : (labels.tax_invoice || "TAX INVOICE").toUpperCase(),
        style: "mainTitle",
        alignment: "center",
        margin: [0, 2, 0, 14],
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
                    width: 56,
                    margin: [0, 2, 0, 8],
                  }
                : {},
              data && data.entity && data.entity.org && data.entity.org.name
                ? { text: data.entity.org.name, style: "header" }
                : {},
              data && data.entity && data.entity.org && data.entity.org.address
                ? { text: data.entity.org.address, style: "inline" }
                : {},
              data && data.entity && data.entity.org && data.entity.org.phone
                ? { text: `${labels.phone || "Phone"}: ${data.entity.org.phone}`, style: "inline" }
                : {},
              data && data.entity && data.entity.org && data.entity.org.email
                ? { text: `${labels.email || "Email"}: ${data.entity.org.email}`, style: "inline" }
                : {},
              data && data.entity && data.entity.org && data.entity.org.gstNo
                ? {
                    text: `${labels.gstin || "GSTIN"}: ${data.entity.org.gstNo}`,
                    style: "inlineBold",
                  }
                : {},
              data && data.entity && data.entity.org && data.entity.org.panNo
                ? {
                    text: `${labels.pan || "PAN"}: ${data.entity.org.panNo}`,
                    style: "inlineBold",
                  }
                : {},
              data &&
              data.entity &&
              data.entity.org &&
              (data.entity.org.stateName || data.entity.org.stateCode)
                ? {
                    text: `${labels.state || "State"}: ${data.entity.org.stateName || ""}${data.entity.org.stateCode ? " (" + data.entity.org.stateCode + ")" : ""}`,
                    style: "inline",
                  }
                : {},
            ],
          },
          {
            width: 220,
            stack: [
              {
                text: (data && data.title ? data.title : labels.tax_invoice || "TAX INVOICE")
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
                      { text: labels.invoice_no || "Invoice No.", style: "metaLabel" },
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
                      { text: labels.invoice_date || "Invoice Date", style: "metaLabel" },
                      {
                        text:
                          data && data.entity && data.entity.date
                            ? new Date(data.entity.date).toLocaleDateString(
                                dateLocale,
                              )
                            : "",
                        style: "metaValue",
                      },
                    ],
                    [
                      { text: labels.po_number || "PO Number", style: "metaLabel" },
                      {
                        text:
                          data && data.entity && data.entity.poNo
                            ? data.entity.poNo
                            : "",
                        style: "metaValue",
                      },
                    ],
                    [
                      { text: labels.po_date || "PO Date", style: "metaLabel" },
                      {
                        text:
                          data && data.entity && data.entity.poDate
                            ? new Date(data.entity.poDate).toLocaleDateString(
                                dateLocale,
                              )
                            : "",
                        style: "metaValue",
                      },
                    ],
                  ],
                },
                layout: "noBorders",
                margin: [0, 10, 0, 0],
              },
            ],
          },
        ],
        columnGap: 18,
      },

      { text: "", margin: [0, 0, 0, 8] },

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
                    text: `${labels.gstin || "GSTIN"}: ${data.entity.party.gstNo}`,
                    style: "inlineBold",
                  }
                : {},
              data &&
              data.entity &&
              data.entity.party &&
              data.entity.party.panNo
                ? { text: `${labels.pan || "PAN"}: ${data.entity.party.panNo}`, style: "inline" }
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
                text: `${labels.date || "Date"}: ${data && data.entity && data.entity.date ? new Date(data.entity.date).toLocaleDateString(dateLocale) : ""}`,
                alignment: "right",
              },
              {
                text: `${labels.number || "Number"}: ${data && data.num ? data.num : ""}`,
                bold: true,
                alignment: "right",
              },
              data && data.entity && data.entity.poNo
                ? { text: `${labels.po_no || "PO No"}: ${data.entity.poNo}`, alignment: "right" }
                : {},
              data && data.entity && data.entity.poDate
                ? {
                    text: `${labels.po_date || "PO Date"}: ${new Date(data.entity.poDate).toLocaleDateString(dateLocale)}`,
                    alignment: "right",
                  }
                : {},
            ],
            alignment: "right",
          },
        ],
        columnGap: 24,
        margin: [0, 0, 0, 16],
      },

      // Items table
      { text: labels.item_details || "Item Details", style: "sectionHeader" },
      {
        table: {
          headerRows: 1,
          widths: [28, "*", 70, 40, 60, 40, 60, 70],
          body: [
            [
              { text: labels.serial_no || "Sno.", style: "tableHeader" },
              { text: labels.items || "Items", style: "tableHeader" },
              { text: labels.hsn_sac_code || "HSN/SAC Code", style: "tableHeader" },
              { text: labels.um || "UM", style: "tableHeader" },
              { text: labels.rate || "Rate", style: "tableHeader" },
              { text: labels.qty || "Qty", style: "tableHeader" },
              { text: labels.tax || "Tax", style: "tableHeader" },
              { text: labels.amount || "Amount", style: "tableHeader" },
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
            if (rowIndex === 0) {
              return palette.accent;
            }

            return rowIndex % 2 === 0 ? palette.surface : null;
          },
          hLineColor: () => palette.border,
          vLineColor: () => palette.border,
          hLineWidth: (index) => (index === 0 ? 0 : 0.75),
          vLineWidth: () => 0.75,
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 7,
          paddingBottom: () => 7,
        },
        margin: [0, 4, 0, 0],
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
                  { text: `${labels.subtotal || "Subtotal"}:`, style: "summaryLabel" },
                  {
                    text: data && data.total != null ? data.total : "₹ 0.00",
                    style: "summaryValue",
                  },
                ],
                ...taxEntries.map(([taxName, taxValue]) => [
                  { text: `${taxName.toString().toUpperCase()}:`, style: "summaryLabel" },
                  { text: taxValue, style: "summaryValue" },
                ]),
                [
                  { text: `${labels.grand_total || "Grand Total"}:`, style: "summaryTotalLabel" },
                  {
                    text:
                      data && data.grandTotal != null
                        ? data.grandTotal
                        : "₹ 0.00",
                    style: "summaryTotalValue",
                  },
                ],
                [
                  { text: `${labels.amount_in_words || "Amount in words"}:`, style: "summaryLabel" },
                  {
                    text: data && data.amountToWords ? data.amountToWords : "",
                    style: "summaryValue",
                  },
                ],
              ],
            },
            layout: {
              hLineColor: () => palette.border,
              vLineWidth: () => 0,
              hLineWidth: (index) => (index === 0 ? 0 : 0.75),
              fillColor: (rowIndex) => (rowIndex === taxEntries.length + 1 ? palette.accentSoft : null),
              paddingLeft: () => 0,
              paddingRight: () => 0,
              paddingTop: () => 6,
              paddingBottom: () => 6,
            },
            margin: [0, 14, 0, 14],
          },
        ],
      },

      // Terms and Bank details
      {
        columns: [
          {
            width: "*",
            stack: [
              {},
            ],
          },
          {
            width: 260,
            stack: [
              data && data.bank
                ? { text: labels.company_bank_details || "Company Bank details", style: "sectionHeader" }
                : {},
              data && data.bank
                ? {
                    table: {
                      widths: ["*", "*"],
                      body: [
                        [
                          { text: labels.bank_name || "Bank Name", style: "bankLabel" },
                          { text: data.bank.name || "", style: "bankValue" },
                        ],
                        [
                          { text: labels.bank_account_no || "Bank Account No.", style: "bankLabel" },
                          { text: data.bank.accountNo || "", style: "bankValue" },
                        ],
                        [
                          { text: labels.bank_ifsc_code || "Bank IFSC code", style: "bankLabel" },
                          { text: data.bank.ifscCode || "", style: "bankValue" },
                        ],
                        [
                          { text: labels.account_holder_name || "Account holder name", style: "bankLabel" },
                          { text: data.bank.accountHolderName || "", style: "bankValue" },
                        ],
                      ],
                    },
                    layout: "noBorders",
                  }
                : {},
              data && data.upiQr
                ? {
                    stack: [
                      { text: labels.upi_qr_code || "UPI QR Code", style: "sectionHeader" },
                      { image: data.upiQr, width: 96, margin: [0, 4, 0, 0] },
                    ],
                    alignment: "right",
                    margin: [0, data && data.bank ? 12 : 0, 0, 0],
                  }
                : {},
            ],
          },
        ],
        margin: [0, 8, 0, 8],
      },

      // Authorized Signatory (kept generic, no personal signature lines)
      {
        margin: [0, 12, 0, 0],
        unbreakable: true,
        table: {
          widths: ["*", 200],
          body: [
            [
              {
                stack: [
                  { text: labels.terms_and_conditions || "Terms and conditions", style: "sectionHeader" },
                  { text: data.entity.terms || "", style: "termsText" },
                ],
                border: [false, false, false, false],
                margin: [0, 0, 12, 0],
              },
              {
                stack: [
                  {
                    text: `For ${data && data.entity && data.entity.org && data.entity.org.name ? data.entity.org.name : ""}`,
                    style: "signatoryBoxCompany",
                    alignment: "center",
                    margin: [0, 0, 0, 24],
                  },
                  {
                    text: " ",
                    margin: [0, 22, 0, 22],
                  },
                  {
                    text: labels.authorized_signatory || "Authorized Signatory",
                    style: "signatoryBoxLabel",
                    alignment: "center",
                  },
                ],
              },
            ],
          ],
        },
        layout: {
          hLineColor: () => palette.border,
          vLineColor: () => palette.border,
          hLineWidth: (index, node) => (index === 0 || index === node.table.body.length ? 0.75 : 0),
          vLineWidth: (index) => (index === 1 || index === 2 ? 0.75 : 0),
          paddingLeft: (columnIndex) => (columnIndex === 0 ? 0 : 10),
          paddingRight: (columnIndex) => (columnIndex === 0 ? 12 : 10),
          paddingTop: () => 10,
          paddingBottom: () => 10,
        },
      },
    ],

    styles: {
      mainTitle: {
        fontSize: 14.4,
        bold: true,
        color: palette.accent,
        characterSpacing: 1.4,
      },
      title: { fontSize: 14.4, bold: true, color: palette.accent },
      header: { fontSize: 11.7, bold: true, color: palette.text, margin: [0, 0, 0, 4] },
      subheader: { fontSize: 9, bold: true, color: palette.accent, margin: [0, 0, 0, 6] },
      sectionHeader: {
        fontSize: 9,
        bold: true,
        margin: [0, 6, 0, 6],
        color: palette.accent,
      },
      inline: { fontSize: 8.1, margin: [0, 2, 0, 2], color: palette.text, lineHeight: 1.35 },
      inlineBold: { fontSize: 8.1, bold: true, margin: [0, 2, 0, 2], color: palette.text, lineHeight: 1.35 },
      tableHeader: { bold: true, color: "white", fontSize: 7.7 },
      metaLabel: { fontSize: 8.1, color: palette.muted, bold: true },
      metaValue: { fontSize: 8.1, bold: true, color: palette.text },
      summaryLabel: { bold: true, color: palette.text },
      summaryValue: { color: palette.text, alignment: "right" },
      summaryTotalLabel: { bold: true, color: palette.accent, fontSize: 9 },
      summaryTotalValue: { bold: true, color: palette.accent, alignment: "right", fontSize: 9 },
      termsText: { fontSize: 8.1, color: palette.text, lineHeight: 1.35 },
      bankLabel: { fontSize: 8.1, color: palette.muted, bold: true, margin: [0, 2, 0, 2] },
      bankValue: { fontSize: 8.1, color: palette.text, margin: [0, 2, 0, 2] },
      signatoryBoxCompany: { fontSize: 8.1, bold: true, color: palette.text },
      signatoryBoxLabel: { fontSize: 8.1, bold: true, color: palette.text },
    },

    defaultStyle: {
      fontSize: 8.1,
      columnGap: 10,
      color: palette.text,
    },
  };
};

module.exports = buzyTemplate;
