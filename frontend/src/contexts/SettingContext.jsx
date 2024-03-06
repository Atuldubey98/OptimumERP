import { createContext } from "react";

const SettingContext = createContext({
  setting: null,
  onSetSettingForOrganization: undefined,
  role: null,
  onSetCurrentOrgRole : undefined,
});

export default SettingContext;
