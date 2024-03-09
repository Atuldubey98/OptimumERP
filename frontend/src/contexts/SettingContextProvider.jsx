import { useContext, useEffect, useState } from "react";
import instance from "../instance";
import SettingContext from "./SettingContext";
import AuthContext from "./AuthContext";
import { useNavigate } from "react-router-dom";
export default function SettingContextProvider({ children }) {
  const [setting, setSetting] = useState(null);
  const onSetSettingForOrganization = (newSetting) => setSetting(newSetting);
  const [currentOrgRole, setCurrentOrgRole] = useState("");
  const onSetCurrentOrgRole = (currentRole) => setCurrentOrgRole(currentRole);
  const userContext = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => {
    const storedOrgId = localStorage.getItem("organization");
    (async () => {
      if (!storedOrgId && userContext.user) {
        navigate("/organizations");
        return;
      }
      try {
        const { data } = await instance.get(
          `/api/v1/organizations/${storedOrgId}/settings`
        );
        setSetting(data.data);
        setCurrentOrgRole(data.role);
      } catch (error) {
        if (storedOrgId) navigate("/login");
      }
    })();
  }, [userContext.user]);
  return (
    <SettingContext.Provider
      value={{
        setting,
        onSetSettingForOrganization,
        role: currentOrgRole,
        onSetCurrentOrgRole,
      }}
    >
      {children}
    </SettingContext.Provider>
  );
}
