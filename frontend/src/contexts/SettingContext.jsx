import { createContext } from "react";

const SettingContext = createContext({
  setting: null,
  onSetSettingForOrganization: undefined,
});

export default SettingContext;
