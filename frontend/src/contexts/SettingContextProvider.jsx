import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import instance from "../instance";
import SettingContext from "./SettingContext";
export default function SettingContextProvider({ children }) {
  const [setting, setSetting] = useState(null);
  const onSetSettingForOrganization = (newSetting) => setSetting(newSetting);
  const [currentOrgRole, setCurrentOrgRole] = useState("");
  const onSetCurrentOrgRole = (currentRole) => setCurrentOrgRole(currentRole);
  const navigate = useNavigate();
  const fetchSetting = async (orgId) => {
    const storedOrgId = localStorage.getItem("organization") || orgId;
    try {
      if (!storedOrgId) return;
      const { data } = await instance.get(
        `/api/v1/organizations/${storedOrgId}/settings`
      );
      setSetting(data.data);
      setCurrentOrgRole(data.role);
      if (orgId) navigate(`/${orgId}/dashboard`);
    } catch (error) {
      localStorage.removeItem("organization");
    }
  };
  useEffect(() => {
    fetchSetting();
  }, [localStorage.getItem("organization")]);
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
