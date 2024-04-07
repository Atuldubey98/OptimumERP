import { useEffect, useState } from "react";
import instance from '../instance';
import AuthContext from "./AuthContext";
export default function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  useEffect(() => {
    setUserLoading(true);
    (async () => {
      try {
        const { data } = await instance.get(`/api/v1/users`);
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setUserLoading(false);
      }
    })();
  }, []);
  const onSetCurrentUser = (user) => {
    setUser(user);
  };
  return (
    <AuthContext.Provider value={{ user, userLoading, onSetCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}
