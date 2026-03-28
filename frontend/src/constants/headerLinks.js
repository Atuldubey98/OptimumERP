import { AiOutlineDashboard } from "react-icons/ai";
import {
  FaFileInvoice,
  FaFileInvoiceDollar,
  FaMoneyBillTrendUp,
} from "react-icons/fa6";
import { IoCartOutline } from "react-icons/io5";
import { GiExpense } from "react-icons/gi";
import { GoPeople, GoTag } from "react-icons/go";
import { ImStatsBars2 } from "react-icons/im";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { TiContacts } from "react-icons/ti";
const headerLinks = [
  { icon: AiOutlineDashboard, link: "/dashboard", label: "Dashboard", labelKey: "common_ui.sidebar.links.dashboard" },
  { icon: ImStatsBars2, link: "/stats", label: "Stats", labelKey: "common_ui.sidebar.links.stats" },
  { icon: GoPeople, link: "/parties", label: "Parties", labelKey: "common_ui.sidebar.links.parties" },
  { icon: TiContacts, link: "/contacts", label: "Contacts", labelKey: "common_ui.sidebar.links.contacts" },
  { icon: FaFileInvoiceDollar, link: "/invoices", label: "Invoices", labelKey: "common_ui.sidebar.links.invoices" },
  {
    icon: LiaFileInvoiceDollarSolid,
    link: "/proformaInvoices",
    label: "Proforma Invoices",
    labelKey: "common_ui.sidebar.links.proforma_invoices",
  },
  {
    icon: IoCartOutline,
    link: "/purchaseOrders",
    label: "Purchase Orders",
    labelKey: "common_ui.sidebar.links.purchase_orders",
  },
  { icon: FaFileInvoice, link: "/estimates", label: "Quotations", labelKey: "common_ui.sidebar.links.quotations" },
  { icon: GiExpense, link: "/expenses", label: "Expenses", labelKey: "common_ui.sidebar.links.expenses" },
  { icon: FaMoneyBillTrendUp, link: "/purchases", label: "Purchase", labelKey: "common_ui.sidebar.links.purchase" },
  { icon: GoTag, link: "/products", label: "Items", labelKey: "common_ui.sidebar.links.items" },
];

export default headerLinks;
