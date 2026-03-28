import { GrUserAdmin } from "react-icons/gr";
import { LuSettings2 } from "react-icons/lu";
import { CgProfile } from "react-icons/cg";
import { HiOutlineReceiptTax } from "react-icons/hi";
import { GiThermometerScale } from "react-icons/gi";
const settingsLinks = [
  { icon: GrUserAdmin, link: "/admin", label: "Admin", labelKey: "common_ui.sidebar.settings_links.admin", role: "admin" },
  {
    icon: LuSettings2,
    link: "/application",
    label: "Application",
    labelKey: "common_ui.sidebar.settings_links.application",
    role: "admin",
  },
  {
    icon: HiOutlineReceiptTax,
    link: "/taxes",
    label: "Taxes",
    labelKey: "common_ui.sidebar.settings_links.taxes",
    role: "user",
  },
  {
    icon: GiThermometerScale,
    link: "/ums",
    label: "Unit of measurement",
    labelKey: "common_ui.sidebar.settings_links.unit_of_measurement",
    role: "user",
  },

  {
    icon: CgProfile,
    link: "/profile-settings",
    label: "Profile",
    labelKey: "common_ui.sidebar.settings_links.profile",
    role: "user",
  },
];

export default settingsLinks;
