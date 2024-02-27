export const reportTypes = [
  {
    type: "Transaction Report",
    children: [
      {
        tab: "sale",
        label: "Sale",
      },
      {
        tab: "purchase",
        label: "Purchase",
      },
      {
        tab: "day-book",
        label: "Day book",
      },
      {
        tab: "transactions",
        label: "Transactions",
      },
    ],
  },
  {
    type: "Part Wise",
    children: [
      {
        tab: "parties",
        label: "Party statement",
      },
      {
        tab: "sale-purchase",
        label: "Sale Purchase By party",
      },
    ],
  },
  {
    type: "GST reports",
    children: [
      {
        tab: "gstr1",
        label: "GSTR1",
      },
      {
        tab: "gstr2",
        label: "GSTR2",
      },
    ],
  },
];
