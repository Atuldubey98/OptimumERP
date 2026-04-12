const borderLandTemplate = (data, color) => {
  const labels = data?.metaLabels || {};
  const dateLocale = data?.dateLocale || "en-IN";
  const hasColor = !!color;
  const palette = {
    accent: color || "#1F2937",
    accentSoft: "#EEF4F8",
    text: "#1F2937",
    muted: "#6B7280",
    border: "#000000",
    surface: "#F8FAFC",
  };
  const taxEntries = Object.entries(data.currencyTaxCategories || {});

  return {
    pageMargins: [22, 22, 22, 24],
    footer: (currentPage, pageCount) => ({
      margin: [26, 0, 26, 11],
      columns: [
        {
          text: data.entity?.org?.name || "",
          color: palette.muted,
          fontSize: 6.9,
        },
        {
          text: `${currentPage} / ${pageCount}`,
          alignment: "right",
          color: palette.muted,
          fontSize: 6.9,
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
        margin: [0, 0, 0, 10],
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
      { text: "", margin: [0, 0, 0, 6] },
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
                stack: [
                  { text: item.taxAmount, style: "taxAmount", noWrap: true },
                  { text: `(${item.gst})`, style: "taxName", noWrap: true },
                ],
                alignment: "right",
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
              return hasColor ? palette.accent : null;
            }

            return rowIndex % 2 === 0 ? palette.surface : null;
          },
          hLineColor: () => palette.border,
          vLineColor: () => palette.border,
          hLineWidth: (index) => (index === 0 ? 0 : 0.75),
          vLineWidth: () => 0.75,
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 5,
          paddingBottom: () => 5,
        },
        margin: [0, 4, 0, 0],
      },
      // TOTAL
      {
        columns: [
          data.bank
            ? {
                stack: [
                  { text: `${labels.bank_account_details || "Bank Account Details"}:`, style: "subheader" },
                  { text: `${labels.bank_name || "Bank Name"}: ${data.bank.name}`, style: "bankDetail" },
                  { text: `${labels.account_holder || "Account Holder"}: ${data.bank.accountHolderName}`, style: "bankDetail" },
                  { text: `${labels.account_number || "Account Number"}: ${data.bank.accountNo}`, style: "bankDetail" },
                  { text: `${labels.ifsc_code || "IFSC Code"}: ${data.bank.ifscCode}`, style: "bankDetail" },
                  ...(data.upiQr
                    ? [
                        { text: labels.upi_qr_code || "UPI QR Code", style: "subheader", margin: [0, 6, 0, 4] },
                        { image: data.upiQr, width: 72 },
                      ]
                    : []),
                ],
              }
            : { text: "" },
          {
            table: {
              headerRows: 0,
              widths: ["*", 80],
              body: [
                [
                  { text: labels.subtotal || "Subtotal", style: "itemsFooterSubTitle" },
                  { text: data.total, style: "itemsFooterSubValue" },
                ],
                ...(data.rawShippingCharges ? [[
                  { text: labels.shipping_charges || "Shipping Charges", style: "itemsFooterSubTitle" },
                  { text: data.shippingCharges, style: "itemsFooterSubValue" },
                ]] : []),
                ...(taxEntries.length
                  ? taxEntries.map(([taxName, taxValue]) => [
                      { text: `${taxName.toLocaleUpperCase()}`, style: "itemsFooterSubTitle" },
                      { text: taxValue, style: "itemsFooterSubValue" },
                    ])
                  : [
                      [
                        { text: labels.tax_upper || "TAX", style: "itemsFooterSubTitle" },
                        { text: data.entity?.totalTax, style: "itemsFooterSubValue" },
                      ],
                    ]),
                [
                  { text: labels.total_upper || "TOTAL", style: "itemsFooterTotalTitle" },
                  { text: data.grandTotal, style: "itemsFooterTotalValue" },
                ],
                [
                  { text: (labels.amount_in_words || "Amount in words").toUpperCase(), style: "itemsFooterSubTitle" },
                  { text: data.amountToWords, style: "itemsFooterSubValue" },
                ],
              ],
            },
            layout: {
              hLineColor: () => palette.border,
              vLineWidth: () => 0,
              hLineWidth: (index) => (index === 0 ? 0 : 0.75),
              paddingLeft: () => 0,
              paddingRight: () => 0,
              paddingTop: () => 4,
              paddingBottom: () => 4,
            },
          },
        ],
        columnGap: 16,
        margin: [0, 10, 0, 12],
      },
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
        margin: [0, 10, 0, 0],
        unbreakable: true,
        table: {
          widths: [120],
          body: [
            [
              {
                stack: [
                  {
                    text: `For ${data.entity?.org?.name || ""}`,
                    style: "signatoryBoxCompany",
                    alignment: "center",
                    margin: [0, 0, 0, 16],
                  },
                  {
                    text: " ",
                    margin: [0, 14, 0, 14],
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
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 7,
          paddingBottom: () => 7,
        },
      },
    ],
    styles: {
      // Document Header
      documentHeaderLeft: {
        fontSize: 9.9,
        margin: [5, 5, 5, 5],
        alignment: "left",
      },
      documentHeaderCenter: {
        fontSize: 9.9,
        margin: [5, 5, 5, 5],
        alignment: "center",
      },
      documentHeaderRight: {
        fontSize: 9.9,
        margin: [5, 5, 5, 5],
        alignment: "right",
      },
      // Document Footer
      documentFooterLeft: {
        fontSize: 9.9,
        margin: [5, 5, 5, 5],
        alignment: "left",
      },
      signatory: { bold: true, decoration: "underline" },
      signatoryBoxCompany: { bold: true, color: palette.text },
      signatoryBoxLabel: { bold: true, color: palette.text },
      subheader: { fontSize: 8.3, bold: true, color: palette.accent, margin: [0, 0, 0, 4] },

      documentFooterCenter: {
        fontSize: 9.9,
        margin: [5, 5, 5, 5],
        alignment: "center",
      },
      documentFooterRight: {
        fontSize: 9.9,
        margin: [5, 5, 5, 5],
        alignment: "right",
      },
      // Invoice Title
      invoiceTitle: {
        fontSize: 14.3,
        bold: true,
        alignment: "right",
        color: palette.accent,
        characterSpacing: 1.0,
        margin: [0, 0, 0, 8],
      },
      // Invoice Details
      invoiceSubTitle: {
        fontSize: 8.3,
        alignment: "right",
        color: palette.muted,
        bold: true,
      },
      invoiceSubValue: { fontSize: 8.8, alignment: "right", color: palette.text, bold: true },
      // Billing Headers
      invoiceBillingTitle: {
        fontSize: 8.3,
        bold: true,
        alignment: "left",
        color: palette.accent,
        margin: [0, 8, 0, 4],
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
        fontSize: 7.7,
      },
      billingMetaValue: {
        color: palette.text,
        bold: true,
        fontSize: 7.7,
      },
      invoiceBillingAddressTitle: {
        margin: [0, 5, 0, 2],
        bold: true,
        color: palette.muted,
        fontSize: 7.7,
      },
      invoiceBillingAddress: { color: palette.text, lineHeight: 1.35 },
      // Items Header
      itemsHeader: {
        margin: [0, 2, 0, 2],
        bold: true,
        color: hasColor ? "white" : palette.text,
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
        fontSize: 8.8,
      },
      itemNumber: {
        margin: [0, 1, 0, 1],
        alignment: "right",
        noWrap: true,
        color: palette.text,
        fontSize: 7.7,
      },
      taxName: { color: palette.muted, fontSize: 7.2 },
      taxAmount: { color: palette.text, fontSize: 7.2 },
      itemPrice: {
        margin: [0, 1, 0, 1],
        alignment: "right",
        noWrap: true,
        color: palette.text,
        fontSize: 7.7,
      },
      itemTotal: {
        margin: [0, 1, 0, 1],
        bold: true,
        alignment: "right",
        color: palette.text,
        fontSize: 7.7,
      },

      // Items Footer (Subtotal, Total, Tax, etc)
      itemsFooterSubTitle: {
        margin: [0, 0, 0, 0],
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
        fontSize: 9.9,
        alignment: "center",
      },
      notesTitle: {
        fontSize: 8.3,
        bold: true,
        margin: [0, 10, 0, 3],
        color: palette.accent,
      },
      notesText: {
        fontSize: 7.7,
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
      fontSize: 7.7,
      color: palette.text,
    },
  };
};
module.exports = borderLandTemplate;
