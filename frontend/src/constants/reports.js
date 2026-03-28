export const reportTypes = [
  {
    type: "report_ui.tabs.transaction_report",
    children: [
      {
        tab: "sale",
        label: "report_ui.report_names.sale",
      },
      {
        tab: "purchase",
        label: "report_ui.report_names.purchase",
      },
      {
        tab: "transactions",
        label: "report_ui.report_names.transactions",
      },
    ],
  },
  // {
  //   type: "Part Wise",
  //   children: [
  //     {
  //       tab: "parties",
  //       label: "Party statement",
  //     },
  //   ],
  // },
  {
    type: "report_ui.tabs.gst_reports",
    children: [
      {
        tab: "gstr1",
        label: "report_ui.report_names.gstr1",
      },
      {
        tab: "gstr2",
        label: "report_ui.report_names.gstr2",
      },
    ],
  },
];
