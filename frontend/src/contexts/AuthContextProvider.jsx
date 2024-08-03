import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import instance from "../instance";
import AuthContext from "./AuthContext";
import SettingContext from "./SettingContext";
export default function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const location = useLocation();
  const setting = useContext(SettingContext);
  const fetchUserDetails = async () => {
    try {
      setUserLoading(true);
      const { data } = await instance.get(`/api/v1/users`);
      await setting.fetchSetting();
      setUser(data);
    } catch (error) {
      setUser(null);
    } finally {
      setUserLoading(false);
    }
  };
  useEffect(() => {
    if (location.pathname === "/auth/google") return;
    fetchUserDetails();
  }, []);
  const onSetCurrentUser = (user) => setUser(user);
  return (
    <AuthContext.Provider
      value={{ user, userLoading, onSetCurrentUser, fetchUserDetails }}
    >
      {children}
    </AuthContext.Provider>
  );
}
