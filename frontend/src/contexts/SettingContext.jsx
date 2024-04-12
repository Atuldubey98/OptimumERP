import { createContext } from "react";

const SettingContext = createContext({
  setting: null,
  onSetSettingForOrganization: undefined,
  role: null,
  onSetCurrentOrgRole : undefined,
  fetchSetting: undefined
});

export default SettingContext;
