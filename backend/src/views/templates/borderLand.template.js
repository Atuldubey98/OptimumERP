const borderLandTemplate = (data, color) => {
  return {
    content: [
      // Header
      {
        columns: [
          data.entity.org.logo
            ? {
                image: data.entity.org.logo,
                width: 50,
                alignment: "center",
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
                      text: "Invoice #",
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
                      text: "Date Issued",
                      style: "invoiceSubTitle",
                      width: "*",
                    },
                    {
                      text: new Date(data.entity.date).toDateString(),
                      style: "invoiceSubValue",
                      width: 100,
                    },
                  ],
                },
              ],
            },
          ],
        ],
      },
      // Billing Headers
      {
        columns: [
          {
            text: "Billing From",
            style: "invoiceBillingTitle",
          },
          {
            text: "Billing To",
            style: "invoiceBillingTitle",
          },
        ],
      },
      // Billing Details
      {
        columns: [
          {
            text: `${data.entity.org.name}`,
            style: "invoiceBillingDetails",
          },
          {
            text: `${data.entity.party.name}`,
            style: "invoiceBillingDetails",
          },
        ],
      },
      // Billing Address Title
      {
        columns: [
          {
            text: "Address",
            style: "invoiceBillingAddressTitle",
          },
          {
            text: "Address",
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
      },
      // Line breaks
      "\n\n",
      // Items
      {
        table: {
          headerRows: 1,
          widths: ["*", 40, "auto", 40, "auto", 80],

          body: [
            [
              {
                text: "Product",
                style: "itemsHeader",
              },
              {
                text: "Qty",
                style: ["itemsHeader", "center"],
              },
              {
                text: "HSN Code",
                style: ["itemsHeader", "center"],
              },
              {
                text: "Tax",
                style: ["itemsHeader", "center"],
              },
              {
                text: "Price",
                style: ["itemsHeader", "center"],
              },
              {
                text: "Total",
                style: ["itemsHeader", "center"],
              },
            ],
            ...data.items.map((item) => [
              [
                {
                  text: item.name,
                  style: "itemTitle",
                },
              ],
              {
                text: item.quantity,
                style: "itemNumber",
              },
              {
                text: item.code,
                style: "itemNumber",
              },
              {
                text: item.gst,
                style: "itemNumber",
              },
              {
                text: item.price,
                style: "itemPrice",
              },
              {
                text: item.total,
                style: "itemTotal",
              },
            ]),
          ],
        },
        layout: {
          fillColor: (rowIndex) => (rowIndex === 0 ? color : null),
        },
        //  layout: 'lightHorizontalLines'
      },
      // TOTAL
      {
        table: {
          headerRows: 0,
          widths: ["*", 80],

          body: [
            [
              {
                text: "Subtotal",
                style: "itemsFooterSubTitle",
              },
              {
                text: data.total,
                style: "itemsFooterSubValue",
              },
            ],
            [
              {
                text: "TAX",
                style: "itemsFooterSubTitle",
              },
              {
                text: data.entity?.totalTax,
                style: "itemsFooterSubValue",
              },
            ],
            [
              {
                text: "TOTAL",
                style: "itemsFooterTotalTitle",
              },
              {
                text: data.grandTotal,
                style: "itemsFooterTotalValue",
              },
            ],
          ],
        },
        layout: "lightHorizontalLines",
      },

      // Signature
     
      {
        text: "AMOUNT IN WORDS",
      },
      {
        text: data.amountToWords,
        style: {
          bold: true,
        },
      },
      {
        text: "Authorized Signatory",
        style: "signatory",
        alignment: "right",
        margin: [0, 50, 0, 0],
      },
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
        text: "Terms and Conditions:",
        style: "notesTitle",
      },
      {
        text: data.entity.terms,
        style: "notesText",
      },
    ],
    styles: {
      // Document Header
      documentHeaderLeft: {
        fontSize: 10,
        margin: [5, 5, 5, 5],
        alignment: "left",
      },
      documentHeaderCenter: {
        fontSize: 10,
        margin: [5, 5, 5, 5],
        alignment: "center",
      },
      documentHeaderRight: {
        fontSize: 10,
        margin: [5, 5, 5, 5],
        alignment: "right",
      },
      // Document Footer
      documentFooterLeft: {
        fontSize: 10,
        margin: [5, 5, 5, 5],
        alignment: "left",
      },
      signatory: { bold: true, decoration: "underline" },
      subheader: { fontSize: 14, bold: true, color: color },

      documentFooterCenter: {
        fontSize: 10,
        margin: [5, 5, 5, 5],
        alignment: "center",
      },
      documentFooterRight: {
        fontSize: 10,
        margin: [5, 5, 5, 5],
        alignment: "right",
      },
      // Invoice Title
      invoiceTitle: {
        fontSize: 22,
        bold: true,
        alignment: "right",
        margin: [0, 0, 0, 15],
      },
      // Invoice Details
      invoiceSubTitle: {
        fontSize: 12,
        alignment: "right",
      },
      invoiceSubValue: {
        fontSize: 12,
        alignment: "right",
      },
      // Billing Headers
      invoiceBillingTitle: {
        fontSize: 14,
        bold: true,
        alignment: "left",
        margin: [0, 20, 0, 5],
      },
      // Billing Details
      invoiceBillingDetails: {
        alignment: "left",
      },
      invoiceBillingAddressTitle: {
        margin: [0, 7, 0, 3],
        bold: true,
      },
      invoiceBillingAddress: {},
      // Items Header
      itemsHeader: {
        margin: [0, 5, 0, 5],
        bold: true,
        color: "white",
      },
      // Item Title
      itemTitle: {
        bold: true,
      },
      itemSubTitle: {
        italics: true,
        fontSize: 11,
      },
      itemNumber: {
        margin: [0, 5, 0, 5],
        alignment: "right",
        noWrap: true,
      },
      itemPrice: {
        margin: [0, 5, 0, 5],
        alignment: "right",
        noWrap: true,
      },
      itemTotal: {
        margin: [0, 5, 0, 5],
        bold: true,
        alignment: "right",
      },

      // Items Footer (Subtotal, Total, Tax, etc)
      itemsFooterSubTitle: {
        margin: [0, 5, 0, 5],
        bold: true,
        alignment: "right",
      },
      itemsFooterSubValue: {
        margin: [0, 5, 0, 5],
        bold: true,
        alignment: "center",
      },
      itemsFooterTotalTitle: {
        margin: [0, 5, 0, 5],
        bold: true,
        alignment: "right",
      },
      itemsFooterTotalValue: {
        margin: [0, 5, 0, 5],
        bold: true,
        alignment: "center",
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
        fontSize: 10,
        alignment: "center",
      },
      notesTitle: {
        fontSize: 10,
        bold: true,
        margin: [0, 50, 0, 3],
      },
      notesText: {
        fontSize: 10,
      },
      center: {
        alignment: "center",
      },
    },
    defaultStyle: {
      columnGap: 10,
      fontSize: 10,
    },
  };
};
module.exports = borderLandTemplate;
