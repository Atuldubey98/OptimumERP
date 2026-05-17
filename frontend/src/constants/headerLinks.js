import { AiOutlineDashboard } from "react-icons/ai";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { IoCartOutline } from "react-icons/io5";
import { GiExpense } from "react-icons/gi";
import { GoPeople, GoTag } from "react-icons/go";
import { ImStatsBars2 } from "react-icons/im";
import { TiContacts } from "react-icons/ti";
import { MdOutlinePayments } from "react-icons/md";

export const mainLinks = [
  { icon: AiOutlineDashboard, link: "/dashboard", labelKey: "common_ui.sidebar.links.dashboard" },
];

export const purchaseLinks = [
  { icon: IoCartOutline, link: "/purchaseOrders", labelKey: "common_ui.sidebar.links.purchase_orders" },
  { icon: FaMoneyBillTrendUp, link: "/purchases", labelKey: "common_ui.sidebar.links.purchase" },
  { icon: GiExpense, link: "/expenses", labelKey: "common_ui.sidebar.links.expenses" },
];

export const accountingLinks = [
  { icon: MdOutlinePayments, link: "/paymentVouchers", labelKey: "common_ui.sidebar.links.payment_vouchers" },
];

export const masterLinks = [
  { icon: GoPeople, link: "/parties", labelKey: "common_ui.sidebar.links.parties" },
  { icon: TiContacts, link: "/contacts", labelKey: "common_ui.sidebar.links.contacts" },
  { icon: GoTag, link: "/products", labelKey: "common_ui.sidebar.links.items" },
];

export const analyticLinks = [
  { icon: ImStatsBars2, link: "/stats", labelKey: "common_ui.sidebar.links.stats" },
];

