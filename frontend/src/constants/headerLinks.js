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
  { icon: AiOutlineDashboard, link: "/dashboard", label: "Dashboard" },
  { icon: ImStatsBars2, link: "/stats", label: "Stats" },
  { icon: GoPeople, link: "/parties", label: "Parties" },
  { icon: TiContacts, link: "/contacts", label: "Contacts" },
  { icon: FaFileInvoiceDollar, link: "/invoices", label: "Invoices" },
  {
    icon: LiaFileInvoiceDollarSolid,
    link: "/proformaInvoices",
    label: "Proforma Invoices",
  },
  {
    icon: IoCartOutline,
    link: "/purchaseOrders",
    label: "Purchase Orders",
  },
  { icon: FaFileInvoice, link: "/estimates", label: "Quotations" },
  { icon: GiExpense, link: "/expenses", label: "Expenses" },
  { icon: FaMoneyBillTrendUp, link: "/purchases", label: "Purchase" },
  { icon: GoTag, link: "/products", label: "Items" },
];

export default headerLinks;
