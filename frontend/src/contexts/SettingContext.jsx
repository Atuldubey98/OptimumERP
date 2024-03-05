import { createContext } from "react";

const SettingContext = createContext({
  setting: null,
  onSetSettingForOrganization: undefined,
  role: null,
});

export default SettingContext;
