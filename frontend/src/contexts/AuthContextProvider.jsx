import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import instance from "../instance";
import AuthContext from "./AuthContext";
export default function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const location = useLocation();

  const fetchUserDetails = async () => {
    try {
      setUserLoading(true);
      const { data } = await instance.get(`/api/v1/users`);
  
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
