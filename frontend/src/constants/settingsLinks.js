import { TbCategory } from "react-icons/tb";
import { GrUserAdmin } from "react-icons/gr";
import { HiOutlineReceiptTax } from "react-icons/hi";
const settingsLinks = [
  { icon: GrUserAdmin, link: "/admin", label: "Admin" },
  {
    icon: TbCategory,
    link: "/expense-cateegories",
    label: "Expense Categories",
  },
  {
    icon: HiOutlineReceiptTax,
    link: "/taxes",
    label: "Type of taxes",
  },
];

export default settingsLinks;
