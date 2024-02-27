import { TbCategory } from "react-icons/tb";
import { GrUserAdmin } from "react-icons/gr";
import { HiOutlineReceiptTax } from "react-icons/hi";
import { LuSettings2 } from "react-icons/lu";
const settingsLinks = [
  { icon: GrUserAdmin, link: "/admin", label: "Admin" },
  {
    icon: HiOutlineReceiptTax,
    link: "/taxes",
    label: "Type of taxes",
  },
  {
    icon: LuSettings2,
    link: "/transaction-settings",
    label: "Transaction Settings",
  },
];

export default settingsLinks;
