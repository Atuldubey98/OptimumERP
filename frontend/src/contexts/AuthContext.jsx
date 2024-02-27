import { createContext } from "react";

const AuthContext = createContext({
  user: null,
  userLoading: "loading",
  onSetCurrentUser: undefined,
});

export default AuthContext;
