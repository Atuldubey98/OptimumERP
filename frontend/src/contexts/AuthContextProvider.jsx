import { useContext, useEffect, useState } from "react";
import instance from "../instance";
import AuthContext from "./AuthContext";
import SettingContext from "./SettingContext";
export default function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const settingContext = useContext(SettingContext);
  const fetchUserDetails = async () => {
    try {
      setUserLoading(true);
      const { data } = await instance.get(`/api/v1/users`);
      setUser(data);
      settingContext.fetchSetting();
    } catch (error) {
      setUser(null);
    } finally {
      setUserLoading(false);
    }
  };
  useEffect(() => {
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
