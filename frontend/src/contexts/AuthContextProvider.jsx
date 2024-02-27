import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import { currentUser } from "../api/login";
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
  console.log({ status });
  const onSetCurrentUser = (user) => {
    setUser(user);
  };
  return (
    <AuthContext.Provider value={{ user, userLoading, onSetCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}
