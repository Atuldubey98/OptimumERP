const buzyTemplate = (data, color) => {
  const labels = data?.metaLabels || {};
  const dateLocale = data?.dateLocale || "en-IN";
  return {
    pageSize: "A4",
    pageMargins: [20, 20, 20, 20],

    content: [
      // Title
      {
        text:
          data && data.title
            ? data.title.toString().toUpperCase()
            : (labels.tax_invoice || "TAX INVOICE").toUpperCase(),
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
        margin: [0, 0, 0, 12],
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
                  { text: `${labels.subtotal || "Subtotal"}:`, bold: true },
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
                  { text: `${labels.grand_total || "Grand Total"}:`, bold: true },
                  {
                    text:
                      data && data.grandTotal != null
                        ? data.grandTotal
                        : "₹ 0.00",
                    alignment: "right",
                  },
                ],
                [
                  { text: `${labels.amount_in_words || "Amount in words"}:`, bold: true },
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
                ? { text: labels.terms_and_conditions || "Terms and conditions", style: "sectionHeader" }
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
                ? { text: labels.company_bank_details || "Company Bank details", style: "sectionHeader" }
                : {},
              data && data.bank
                ? {
                    table: {
                      widths: ["*", "*"],
                      body: [
                        [labels.bank_name || "Bank Name", data.bank.name || ""],
                        [labels.bank_account_no || "Bank Account No.", data.bank.accountNo || ""],
                        [labels.bank_ifsc_code || "Bank IFSC code", data.bank.ifscCode || ""],
                        [
                          labels.account_holder_name || "Account holder name",
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
                        text: labels.authorized_signatory || "Authorized Signatory",
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
