import { createContext } from "react";

const AuthContext = createContext({
  user: null,
  userLoading: true,
  onSetCurrentUser: undefined,
});

export default AuthContext;
