import { createContext } from "react";

const AuthContext = createContext({
  user: null,
  userLoading: true,
  onSetCurrentUser: undefined,
  fetchUserDetails: undefined,
});

export default AuthContext;
