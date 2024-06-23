import { GrUserAdmin } from "react-icons/gr";
import { LuSettings2 } from "react-icons/lu";
import { CgProfile } from "react-icons/cg";
const settingsLinks = [
  { icon: GrUserAdmin, link: "/admin", label: "Admin", role: "admin" },
  {
    icon: LuSettings2,
    link: "/transaction-settings",
    label: "Application",
    role: "admin",
  },
  {
    icon: CgProfile,
    link: "/profile-settings",
    label: "Profile",
    role: "user",
  },
];

export default settingsLinks;
