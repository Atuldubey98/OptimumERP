import { useEffect, useState } from "react";
import { currentUser } from "../api/login";
import AuthContext from "./AuthContext";
export default function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  useEffect(() => {
    setUserLoading(true);
    (async () => {
      try {
        const { data } = await currentUser();
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
