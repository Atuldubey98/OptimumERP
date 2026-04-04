const borderLandTemplate = (data, color) => {
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
  const taxEntries = Object.entries(data.currencyTaxCategories || {});

  return {
    pageMargins: [24, 24, 24, 30],
    footer: (currentPage, pageCount) => ({
      margin: [24, 0, 24, 10],
      columns: [
        {
          text: data.entity?.org?.name || "",
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
      {
        columns: [
          data.entity.org.logo
            ? {
                image: data.entity.org.logo,
                width: 56,
                alignment: "left",
                margin: [0, 6, 0, 0],
              }
            : {},
          [
            {
              text: data.title.toLocaleUpperCase(),
              style: "invoiceTitle",
              width: "*",
            },
            {
              stack: [
                {
                  columns: [
                    {
                      text: labels.invoice_hash || "Invoice #",
                      style: "invoiceSubTitle",
                      width: "*",
                    },
                    {
                      text: data.num,
                      style: "invoiceSubValue",
                      width: 100,
                    },
                  ],
                },
                {
                  columns: [
                    {
                      text: labels.date_issued || "Date Issued",
                      style: "invoiceSubTitle",
                      width: "*",
                    },
                    {
                      text: new Date(data.entity.date).toLocaleDateString(dateLocale),
                      style: "invoiceSubValue",
                      width: 100,
                    },
                  ],
                },
                data.entity.poNo
                  ? {
                      columns: [
                        {
                          text: labels.po_no || "PO No",
                          style: "invoiceSubTitle",
                          width: "*",
                        },
                        {
                          text: data.entity.poNo,
                          style: "invoiceSubValue",
                          width: 100,
                        },
                      ],
                    }
                  : {},
                data.entity.poDate
                  ? {
                      columns: [
                        {
                          text: labels.po_date || "PO Date",
                          style: "invoiceSubTitle",
                          width: "*",
                        },
                        {
                          text: new Date(data.entity.poDate).toLocaleDateString(dateLocale),
                          style: "invoiceSubValue",
                          width: 100,
                        },
                      ],
                    }
                  : {},
              ],
            },
          ],
        ],
        columnGap: 16,
        margin: [0, 0, 0, 18],
      },
      // Billing Headers
      {
        columns: [
          {
            text: labels.billing_from || "Billing From",
            style: "invoiceBillingTitle",
          },
          {
            text: labels.billing_to || "Billing To",
            style: "invoiceBillingTitle",
          },
        ],
        columnGap: 24,
      },
      // Billing Details
      {
        columns: [
          {
            stack: [
              {
                text: `${data.entity.org.name}`,
                style: "invoiceBillingDetails",
              },
              data.entity.org.gstNo
                ? {
                    text: [
                      { text: `${labels.gstin || "GSTIN"}: `, style: "billingMetaLabel" },
                      { text: data.entity.org.gstNo, style: "billingMetaValue" },
                    ],
                  }
                : {},
              data.entity.org.panNo
                ? {
                    text: [
                      { text: `${labels.pan || "PAN"}: `, style: "billingMetaLabel" },
                      { text: data.entity.org.panNo, style: "billingMetaValue" },
                    ],
                  }
                : {},
            ],
          },
          {
            stack: [
              {
                text: `${data.entity.party.name}`,
                style: "invoiceBillingDetails",
              },
              data.entity.party.gstNo
                ? {
                    text: [
                      { text: `${labels.gstin || "GSTIN"}: `, style: "billingMetaLabel" },
                      { text: data.entity.party.gstNo, style: "billingMetaValue" },
                    ],
                  }
                : {},
              data.entity.party.panNo
                ? {
                    text: [
                      { text: `${labels.pan || "PAN"}: `, style: "billingMetaLabel" },
                      { text: data.entity.party.panNo, style: "billingMetaValue" },
                    ],
                  }
                : {},
            ],
          },
        ],
        columnGap: 24,
      },
      // Billing Address Title
      {
        columns: [
          {
            text: labels.address || "Address",
            style: "invoiceBillingAddressTitle",
          },
          {
            text: labels.address || "Address",
            style: "invoiceBillingAddressTitle",
          },
        ],
      },
      // Billing Address
      {
        columns: [
          {
            text: data.entity?.org.address,
            style: "invoiceBillingAddress",
          },
          {
            text: data.entity.billingAddress,
            style: "invoiceBillingAddress",
          },
        ],
        columnGap: 24,
        margin: [0, 0, 0, 6],
      },
      // Line breaks
      { text: "", margin: [0, 0, 0, 10] },
      // Items
      {
        table: {
          headerRows: 1,
          widths: ["*", 32, 58, 52, 72, 78],
          dontBreakRows: true,

          body: [
            [
              {
                text: labels.product || "Product",
                style: "itemsHeader",
              },
              {
                text: labels.qty || "Qty",
                style: ["itemsHeader", "center"],
              },
              {
                text: labels.hsn_sac_code || "HSN Code",
                style: ["itemsHeader", "center"],
              },
              {
                text: labels.tax || "Tax",
                style: ["itemsHeader", "center"],
              },
              {
                text: labels.price || "Price",
                style: ["itemsHeader", "center"],
              },
              {
                text: labels.total || "Total",
                style: ["itemsHeader", "center"],
              },
            ],
            ...data.items.map((item) => [
              [
                {
                  text: item.name,
                  style: "itemTitle",
                  alignment: "left",
                },
              ],
              {
                text: item.quantity,
                style: "itemNumber",
                alignment: "center",
              },
              {
                text: item.code,
                style: "itemNumber",
                noWrap: true,
              },
              {
                text: item.gst,
                style: "itemNumber",
                noWrap: true,
              },
              {
                text: item.price,
                style: "itemPrice",
                noWrap: true,
              },
              {
                text: item.total,
                style: "itemTotal",
                noWrap: true,
              },
            ]),
          ],
        },
        layout: {
          fillColor: (rowIndex) => {
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
      // TOTAL
      {
        table: {
          headerRows: 0,
          widths: ["*", 80],

          body: [
            [
              {
                text: labels.subtotal || "Subtotal",
                style: "itemsFooterSubTitle",
              },
              {
                text: data.total,
                style: "itemsFooterSubValue",
              },
            ],
            [
              {
                text: labels.shipping_charges || "Shipping Charges",
                style: "itemsFooterSubTitle",
              },
              {
                text: data.shippingCharges,
                style: "itemsFooterSubValue",
              },
            ],
            ...(
              taxEntries.length
                ? taxEntries.map(([taxName, taxValue]) => [
                    {
                      text: `${taxName.toLocaleUpperCase()}`,
                      style: "itemsFooterSubTitle",
                    },
                    {
                      text: taxValue,
                      style: "itemsFooterSubValue",
                    },
                  ])
                : [
                    [
                      {
                        text: labels.tax_upper || "TAX",
                        style: "itemsFooterSubTitle",
                      },
                      {
                        text: data.entity?.totalTax,
                        style: "itemsFooterSubValue",
                      },
                    ],
                  ]
            ),
            [
              {
                text: labels.total_upper || "TOTAL",
                style: "itemsFooterTotalTitle",
              },
              {
                text: data.grandTotal,
                style: "itemsFooterTotalValue",
              },
            ],
          ],
        },
        layout: {
          hLineColor: () => palette.border,
          vLineWidth: () => 0,
          hLineWidth: (index) => (index === 0 ? 0 : 0.75),
          fillColor: (rowIndex) => {
            const totalRowIndex = taxEntries.length ? taxEntries.length + 2 : 3;

            return rowIndex === totalRowIndex ? palette.accentSoft : null;
          },
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        },
        margin: [0, 18, 0, 18],
      },

      // Signature

      {
        text: (labels.amount_in_words || "Amount in words").toUpperCase(),
        style: "notesTitle",
        margin: [0, 0, 0, 4],
      },
      {
        text: data.amountToWords,
        style: "amountWords",
      },
      data.bank
        ? {
            columns: [
              {
                stack: [
                  { text: `${labels.bank_account_details || "Bank Account Details"}:`, style: "subheader" },
                  { text: `${labels.bank_name || "Bank Name"}: ${data.bank.name}`, style: "bankDetail" },
                  { text: `${labels.account_holder || "Account Holder"}: ${data.bank.accountHolderName}`, style: "bankDetail" },
                  { text: `${labels.account_number || "Account Number"}: ${data.bank.accountNo}`, style: "bankDetail" },
                  { text: `${labels.ifsc_code || "IFSC Code"}: ${data.bank.ifscCode}`, style: "bankDetail" },
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
            columnGap: 24,
            margin: [0, 16, 0, 0],
          }
        : {},
      {
        text: `${labels.terms_and_conditions || "Terms and Conditions"}:`,
        style: "notesTitle",
      },
      {
        text: data.entity.terms,
        style: "notesText",
        margin: [0, 0, 0, 4],
      },
      {
        alignment: "right",
        margin: [0, 18, 0, 0],
        unbreakable: true,
        table: {
          widths: [190],
          body: [
            [
              {
                stack: [
                  {
                    text: `For ${data.entity?.org?.name || ""}`,
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
          hLineWidth: () => 0.75,
          vLineWidth: () => 0.75,
          paddingLeft: () => 10,
          paddingRight: () => 10,
          paddingTop: () => 10,
          paddingBottom: () => 10,
        },
      },
    ],
    styles: {
      // Document Header
      documentHeaderLeft: {
        fontSize: 9,
        margin: [5, 5, 5, 5],
        alignment: "left",
      },
      documentHeaderCenter: {
        fontSize: 9,
        margin: [5, 5, 5, 5],
        alignment: "center",
      },
      documentHeaderRight: {
        fontSize: 9,
        margin: [5, 5, 5, 5],
        alignment: "right",
      },
      // Document Footer
      documentFooterLeft: {
        fontSize: 9,
        margin: [5, 5, 5, 5],
        alignment: "left",
      },
      signatory: { bold: true, decoration: "underline" },
      signatoryBoxCompany: { bold: true, color: palette.text },
      signatoryBoxLabel: { bold: true, color: palette.text },
      subheader: { fontSize: 9, bold: true, color: palette.accent, margin: [0, 0, 0, 6] },

      documentFooterCenter: {
        fontSize: 9,
        margin: [5, 5, 5, 5],
        alignment: "center",
      },
      documentFooterRight: {
        fontSize: 9,
        margin: [5, 5, 5, 5],
        alignment: "right",
      },
      // Invoice Title
      invoiceTitle: {
        fontSize: 18,
        bold: true,
        alignment: "right",
        color: palette.accent,
        characterSpacing: 1.2,
        margin: [0, 0, 0, 12],
      },
      // Invoice Details
      invoiceSubTitle: {
        fontSize: 8.1,
        alignment: "right",
        color: palette.muted,
        bold: true,
      },
      invoiceSubValue: { fontSize: 9, alignment: "right", color: palette.text, bold: true },
      // Billing Headers
      invoiceBillingTitle: {
        fontSize: 9,
        bold: true,
        alignment: "left",
        color: palette.accent,
        margin: [0, 12, 0, 6],
      },
      // Billing Details
      invoiceBillingDetails: {
        alignment: "left",
        bold: true,
        color: palette.text,
        margin: [0, 0, 0, 2],
      },
      billingMetaLabel: {
        color: palette.muted,
        bold: true,
        fontSize: 8.1,
      },
      billingMetaValue: {
        color: palette.text,
        bold: true,
        fontSize: 8.1,
      },
      invoiceBillingAddressTitle: {
        margin: [0, 7, 0, 3],
        bold: true,
        color: palette.muted,
        fontSize: 8.1,
      },
      invoiceBillingAddress: { color: palette.text, lineHeight: 1.35 },
      // Items Header
      itemsHeader: {
        margin: [0, 3, 0, 3],
        bold: true,
        color: "white",
        fontSize: 7.7,
      },
      // Item Title
      itemTitle: {
        bold: true,
        color: palette.text,
        fontSize: 7.7,
        lineHeight: 1.2,
      },
      itemSubTitle: {
        italics: true,
        fontSize: 9.9,
      },
      itemNumber: {
        margin: [0, 2, 0, 2],
        alignment: "right",
        noWrap: true,
        color: palette.text,
        fontSize: 7.7,
      },
      itemPrice: {
        margin: [0, 2, 0, 2],
        alignment: "right",
        noWrap: true,
        color: palette.text,
        fontSize: 7.7,
      },
      itemTotal: {
        margin: [0, 2, 0, 2],
        bold: true,
        alignment: "right",
        color: palette.text,
        fontSize: 7.7,
      },

      // Items Footer (Subtotal, Total, Tax, etc)
      itemsFooterSubTitle: {
        margin: [0, 0, 0, 0],
        bold: true,
        alignment: "right",
        color: palette.text,
      },
      itemsFooterSubValue: {
        margin: [0, 0, 0, 0],
        bold: true,
        alignment: "right",
        color: palette.text,
      },
      itemsFooterTotalTitle: {
        margin: [0, 0, 0, 0],
        bold: true,
        alignment: "right",
        color: palette.accent,
      },
      itemsFooterTotalValue: {
        margin: [0, 0, 0, 0],
        bold: true,
        alignment: "right",
        color: palette.accent,
      },
      signaturePlaceholder: {
        margin: [0, 70, 0, 0],
      },
      signatureName: {
        bold: true,
        alignment: "center",
      },
      signatureJobTitle: {
        italics: true,
        fontSize: 9,
        alignment: "center",
      },
      notesTitle: {
        fontSize: 8.1,
        bold: true,
        margin: [0, 18, 0, 4],
        color: palette.accent,
      },
      notesText: {
        fontSize: 8.1,
        lineHeight: 1.35,
        color: palette.text,
      },
      amountWords: {
        bold: true,
        color: palette.text,
        margin: [0, 0, 0, 4],
      },
      bankDetail: {
        color: palette.text,
        margin: [0, 2, 0, 2],
      },
      center: {
        alignment: "center",
      },
    },
    defaultStyle: {
      columnGap: 10,
      fontSize: 8.1,
      color: palette.text,
    },
  };
};
module.exports = borderLandTemplate;
