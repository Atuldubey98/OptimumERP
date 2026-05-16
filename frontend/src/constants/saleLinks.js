import {
  FaFileInvoice,
  FaFileInvoiceDollar,
} from "react-icons/fa6";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { MdCached } from "react-icons/md";

const saleLinks = [
  { icon: FaFileInvoice, link: "/estimates", label: "Quotations", labelKey: "common_ui.sidebar.links.quotations" },
  {
    icon: LiaFileInvoiceDollarSolid,
    link: "/proformaInvoices",
    label: "Proforma Invoices",
    labelKey: "common_ui.sidebar.links.proforma_invoices",
  },
  { icon: FaFileInvoiceDollar, link: "/invoices", label: "Invoices", labelKey: "common_ui.sidebar.links.invoices" },
  {
    icon: MdCached,
    link: "/recurringInvoices",
    feature: "recurring_invoice",
    label: "Recurring Invoices",
    labelKey: "common_ui.sidebar.links.recurring_invoices",
  },
];

export default saleLinks;
