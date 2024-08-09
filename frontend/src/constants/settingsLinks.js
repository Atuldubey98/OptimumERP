import { GrUserAdmin } from "react-icons/gr";
import { LuSettings2 } from "react-icons/lu";
import { CgProfile } from "react-icons/cg";
import { HiOutlineReceiptTax } from "react-icons/hi";
import { GiThermometerScale } from "react-icons/gi";
const settingsLinks = [
  { icon: GrUserAdmin, link: "/admin", label: "Admin", role: "admin" },
  {
    icon: LuSettings2,
    link: "/application",
    label: "Application",
    role: "admin",
  },
  {
    icon: HiOutlineReceiptTax,
    link: "/taxes",
    label: "Taxes",
    role: "user",
  },
  {
    icon: GiThermometerScale,
    link: "/ums",
    label: "Unit of measurement",
    role: "user",
  },

  {
    icon: CgProfile,
    link: "/profile-settings",
    label: "Profile",
    role: "user",
  },
];

export default settingsLinks;
