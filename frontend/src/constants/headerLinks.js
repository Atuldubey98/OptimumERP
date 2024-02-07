import { AiOutlineDashboard } from "react-icons/ai";
import { AiOutlineCustomerService } from "react-icons/ai";
import { FaFileInvoiceDollar } from "react-icons/fa6";
import { FaFileInvoice } from "react-icons/fa6";
import { GiExpense } from "react-icons/gi";
import { GoTag } from "react-icons/go";
const headerLinks = [
  { icon: AiOutlineDashboard, link: "/dashboard", label: "Dashboard" },
  { icon: AiOutlineCustomerService, link: "/customers", label: "Customers" },
  { icon: FaFileInvoiceDollar, link: "/invoices", label: "Invoices" },
  { icon: FaFileInvoice, link: "/estimates", label: "Quotations" },
  { icon: GiExpense, link: "/expenses", label: "Expenses" },
  { icon: GoTag, link: "/products", label: "Products" },
];

export default headerLinks;
