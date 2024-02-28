import { useEffect, useState } from "react";
import { currentUser } from "../api/login";
import AuthContext from "./AuthContext";
export default function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    (async () => {
      try {
        setStatus("loading");
        const { data } = await currentUser();
        setUser(data);
        setStatus("success");
      } catch (error) {
        setStatus("failure");
      }
    })();
  }, []);
  const userLoading = status === "loading";
  const onSetCurrentUser = (user) => {
    setUser(user);
  };
  return (
    <AuthContext.Provider value={{ user, userLoading, onSetCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}
