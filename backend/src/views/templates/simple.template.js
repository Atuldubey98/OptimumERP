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
      // Title
      {
        text: data.title.toLocaleUpperCase(),
        style: "mainTitle",
        alignment: "center",
        margin: [0, 2, 0, 14],
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
        margin: [0, 0, 0, 18],
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
        columnGap: 24,
        margin: [0, 0, 0, 18],
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
              item.gst,
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
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 7,
          paddingBottom: () => 7,
        },
        margin: [0, 6, 0, 0],
      },
      {
        table: {
          widths: ["*", "auto"],
          body: [
            [{ text: `${labels.subtotal || "Subtotal"}:`, style: "summaryLabel" }, { text: data.total, style: "summaryValue" }],
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
          fillColor: (rowIndex) => (rowIndex === taxEntries.length + 1 ? palette.accentSoft : null),
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        },
        margin: [0, 20, 0, 20],
      },
      data.bank
        ? {
            columns: [
              {
                stack: [
                  { text: `${labels.bank_account_details || "Bank Account Details"}:`, style: "subheader" },
                  { text: `${labels.bank_name || "Bank Name"}: ${data.bank.name}` },
                  { text: `${labels.account_holder || "Account Holder"}: ${data.bank.accountHolderName}` },
                  { text: `${labels.account_number || "Account Number"}: ${data.bank.accountNo}` },
                  { text: `${labels.ifsc_code || "IFSC Code"}: ${data.bank.ifscCode}` },
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
          }
        : {},
      {
        margin: [0, 18, 0, 0],
        unbreakable: true,
        table: {
          widths: ["*", 180],
          body: [
            [
              {
                stack: [
                  { text: `${labels.terms_and_conditions || "Terms and Conditions"}:`, style: "termsHeading" },
                  { text: data.entity.terms || "", style: "terms" },
                ],
                border: [false, false, false, false],
                margin: [0, 0, 12, 0],
              },
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
          hLineColor: (index, node, columnIndex) =>
            columnIndex === 1 ? palette.border : palette.border,
          vLineColor: (index, node, columnIndex) =>
            columnIndex === 1 ? palette.border : palette.border,
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
      header: { fontSize: 13.5, bold: true, color: palette.text, margin: [0, 0, 0, 4] },
      subheader: {
        fontSize: 8.1,
        bold: true,
        color: palette.accent,
        margin: [0, 0, 0, 6],
      },
      tableHeader: { bold: true, color: "white", fontSize: 7.7, margin: [0, 2, 0, 2] },
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
        fontSize: 14.4,
        bold: true,
        color: palette.accent,
        characterSpacing: 1.4,
      },
      companyMeta: { color: palette.muted, lineHeight: 1.35 },
      companyMetaStrong: { color: palette.text, bold: true },
      metaLabel: { color: palette.muted, bold: true },
      partyName: { bold: true, fontSize: 9.5, color: palette.text, margin: [0, 0, 0, 2] },
      bodyText: { color: palette.text, lineHeight: 1.35 },
      bodyTextStrong: { color: palette.text, bold: true, lineHeight: 1.35 },
      summaryLabel: { bold: true, color: palette.text },
      summaryValue: { color: palette.text, alignment: "right" },
      summaryTotalLabel: { bold: true, color: palette.accent, fontSize: 9 },
      summaryTotalValue: { bold: true, color: palette.accent, alignment: "right", fontSize: 9 },
    },
    defaultStyle: {
      fontSize: 7.7,
      lineHeight: 1.3,
      color: palette.text,
    },
  };
};

module.exports = simpleTemplate;
