import { useContext, useEffect, useState } from "react";
import instance from "../instance";
import AuthContext from "./AuthContext";
import SettingContext from "./SettingContext";
export default function SettingContextProvider({ children }) {
  const [setting, setSetting] = useState(null);
  const onSetSettingForOrganization = (newSetting) => setSetting(newSetting);
  const [currentOrgRole, setCurrentOrgRole] = useState("");
  const onSetCurrentOrgRole = (currentRole) => setCurrentOrgRole(currentRole);
  const userContext = useContext(AuthContext);
  const fetchSetting = async () => {
    const storedOrgId = localStorage.getItem("organization");
    if (!storedOrgId && userContext.user) return;
    try {
      const { data } = await instance.get(
        `/api/v1/organizations/${storedOrgId}/settings`
      );
      setSetting(data.data);
      setCurrentOrgRole(data.role);
    } catch (error) {
      localStorage.removeItem("organization");
    }
  };
  useEffect(() => {
    fetchSetting();
  }, [userContext.user]);
  return (
    <SettingContext.Provider
      value={{
        setting,
        onSetSettingForOrganization,
        role: currentOrgRole,
        onSetCurrentOrgRole,
        fetchSetting,
      }}
    >
      {children}
    </SettingContext.Provider>
  );
}
