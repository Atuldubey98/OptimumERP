import { createContext } from "react";
const OrgContext = createContext({
  selectedOrg: null,
  status: "loading",
  onSetOrg: undefined,
});

export default OrgContext;
