const simpleTemplate = (data, color) => {
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
    pageMargins: [20, 20, 20, 22],
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
      // Title
      {
        text: data.title.toLocaleUpperCase(),
        style: "mainTitle",
        alignment: "center",
        margin: [0, 0, 0, 8],
      },
      {
        columns: [
          data.entity.org.logo
            ? {
                image: data.entity.org.logo,
                width: 56,
                alignment: "left",
                margin: [0, 4, 0, 0],
              }
            : {},
          {
            stack: [
              { text: data.entity.org.name, style: "header" },
              { text: data.entity.org.address, style: "companyMeta" },
              data.entity.org.gstNo
                ? {
                    text: [
                      { text: `${labels.gstin || "GSTIN"}: `, style: "metaLabel" },
                      { text: data.entity.org.gstNo, style: "companyMetaStrong" },
                    ],
                  }
                : {},
              data.entity.org.panNo
                ? {
                    text: [
                      { text: `${labels.pan || "PAN"}: `, style: "metaLabel" },
                      { text: data.entity.org.panNo, style: "companyMetaStrong" },
                    ],
                  }
                : {},
            ],
            alignment: "right",
          },
        ],
        columnGap: 16,
        alignment: "center",
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            stack: [
              { text: data.partyMetaHeading, style: "subheader" },
              { text: data.entity.party.name, style: "partyName" },
              { text: data.entity.billingAddress, style: "bodyText" },
              data.entity.party.gstNo
                ? {
                    text: [
                      { text: `${labels.gstin || "GSTIN"}: `, style: "metaLabel" },
                      { text: data.entity.party.gstNo, style: "bodyTextStrong" },
                    ],
                  }
                : {},
              data.entity.party.panNo
                ? {
                    text: [
                      { text: `${labels.pan || "PAN"}: `, style: "metaLabel" },
                      { text: data.entity.party.panNo, style: "bodyTextStrong" },
                    ],
                  }
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
                style: "bodyText",
              },
              { text: `${labels.number || "Number"}: ${data.num}`, style: "bodyTextStrong" },
              data.entity.poNo ? { text: `${labels.po_no || "PO No"}: ${data.entity.poNo}`, style: "bodyText" } : {},
              data.entity.poDate
                ? {
                    text: `${labels.po_date || "PO Date"}: ${new Date(
                      data.entity.poDate,
                    ).toLocaleDateString(dateLocale)}`,
                    style: "bodyText",
                  }
                : {},
            ],
            alignment: "right",
          },
        ],
        columnGap: 20,
        margin: [0, 0, 0, 10],
      },

      {
        table: {
          headerRows: 1,
          widths: ["auto", "*", 60, "auto", "auto", "auto", "auto", "auto"],
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
              {
                stack: [
                  { text: item.taxAmount, style: "taxAmount", noWrap: true },
                  { text: `(${item.gst})`, style: "taxName", noWrap: true },
                ],
                alignment: "right",
              },
              { text: item.total, noWrap: true, alignment: "right" },
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
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 5,
          paddingBottom: () => 5,
        },
        margin: [0, 6, 0, 0],
      },
      {
        columns: [
          data.bank
            ? {
                stack: [
                  { text: `${labels.bank_account_details || "Bank Account Details"}:`, style: "subheader" },
                  { text: `${labels.bank_name || "Bank Name"}: ${data.bank.name}` },
                  { text: `${labels.account_holder || "Account Holder"}: ${data.bank.accountHolderName}` },
                  { text: `${labels.account_number || "Account Number"}: ${data.bank.accountNo}` },
                  { text: `${labels.ifsc_code || "IFSC Code"}: ${data.bank.ifscCode}` },
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
              widths: ["*", "auto"],
              body: [
                [{ text: `${labels.subtotal || "Subtotal"}:`, style: "summaryLabel" }, { text: data.total, style: "summaryValue" }],
                ...(data.rawShippingCharges ? [[{ text: `${labels.shipping_charges || "Shipping Charges"}:`, style: "summaryLabel" }, { text: data.shippingCharges, style: "summaryValue" }]] : []),
                ...taxEntries.map(
                  ([taxName, taxValue]) => [
                    { text: `${taxName.toLocaleUpperCase()}:`, style: "summaryLabel" },
                    { text: taxValue, style: "summaryValue" },
                  ],
                ),
                [
                  { text: `${labels.grand_total || "Grand Total"}:`, style: "summaryTotalLabel" },
                  { text: data.grandTotal, style: "summaryTotalValue" },
                ],
                [
                  { text: `${labels.amount_in_words || "Amount in words"}:`, style: "summaryLabel" },
                  { text: data.amountToWords, style: "summaryValue" },
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
        margin: [0, 12, 0, 14],
      },
      {
        margin: [0, 10, 0, 0],
        unbreakable: true,
        table: {
          widths: ["*", 120],
          body: [
            [
              {
                stack: [
                  { text: `${labels.terms_and_conditions || "Terms and Conditions"}:`, style: "termsHeading" },
                  { text: data.entity.terms || "", style: "terms" },
                ],
                border: [false, false, false, false],
                margin: [0, 0, 10, 0],
              },
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
          hLineColor: (index, node, columnIndex) =>
            columnIndex === 1 ? palette.border : palette.border,
          vLineColor: (index, node, columnIndex) =>
            columnIndex === 1 ? palette.border : palette.border,
          hLineWidth: (index, node) => (index === 0 || index === node.table.body.length ? 0.75 : 0),
          vLineWidth: (index) => (index === 1 || index === 2 ? 0.75 : 0),
          paddingLeft: (columnIndex) => (columnIndex === 0 ? 0 : 8),
          paddingRight: (columnIndex) => (columnIndex === 0 ? 10 : 8),
          paddingTop: () => 7,
          paddingBottom: () => 7,
        },
      },
    ],
    styles: {
      header: { fontSize: 11, bold: true, color: palette.text, margin: [0, 0, 0, 2] },
      subheader: {
        fontSize: 7.5,
        bold: true,
        color: palette.accent,
        margin: [0, 0, 0, 4],
      },
      tableHeader: { bold: true, color: "white", fontSize: 7, margin: [0, 1, 0, 1] },
      termsHeading: { bold: true, color: palette.accent, margin: [0, 0, 0, 4] },
      terms: { italics: true, color: palette.text, lineHeight: 1.35 },
      signatory: {
        bold: true,
        decoration: "underline",
        color: palette.text,
      },
      signatoryBoxCompany: { bold: true, color: palette.text },
      signatoryBoxLabel: { bold: true, color: palette.text },
      mainTitle: {
        fontSize: 12,
        bold: true,
        color: palette.accent,
        characterSpacing: 1.2,
      },
      companyMeta: { color: palette.muted, lineHeight: 1.35 },
      companyMetaStrong: { color: palette.text, bold: true },
      metaLabel: { color: palette.muted, bold: true },
      partyName: { bold: true, fontSize: 8.5, color: palette.text, margin: [0, 0, 0, 2] },
      bodyText: { color: palette.text, lineHeight: 1.35 },
      bodyTextStrong: { color: palette.text, bold: true, lineHeight: 1.35 },
      summaryLabel: { bold: true, color: palette.text },
      summaryValue: { color: palette.text, alignment: "right" },
      summaryTotalLabel: { bold: true, color: palette.accent, fontSize: 8 },
      summaryTotalValue: { bold: true, color: palette.accent, alignment: "right", fontSize: 8 },
      taxName: { color: palette.muted, fontSize: 6.5 },
      taxAmount: { bold: true, color: palette.text, fontSize: 6.5 },
    },
    defaultStyle: {
      fontSize: 7,
      lineHeight: 1.25,
      color: palette.text,
    },
  };
};

module.exports = simpleTemplate;
