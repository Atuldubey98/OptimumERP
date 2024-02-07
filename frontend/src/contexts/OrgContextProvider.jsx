import { useState } from "react";
import OrgContext from "./OrgContext";

export default function OrgContextProvider({ children }) {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [status, setStatus] = useState("loading");
  const onSetOrg = (orgId) => {
    setSelectedOrg(orgId);
    localStorage.setItem("org", orgId);
  };
  return (
    <OrgContext.Provider value={{ selectedOrg, status, onSetOrg }}>
      {children}
    </OrgContext.Provider>
  );
}
