import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";

export default function useAuth() {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const onSetCurrentUser = authContext?.onSetCurrentUser;
  const loading = authContext?.userLoading;
  return { user, loading, onSetCurrentUser };
}
