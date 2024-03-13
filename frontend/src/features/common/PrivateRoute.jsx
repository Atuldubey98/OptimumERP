import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import FullLoader from "./FullLoader";
export default function PrivateRoute({ children }) {
  const authCtxt = useContext(AuthContext);
  const loading = authCtxt?.userLoading;
  const user = authCtxt?.user;
  return loading ? (
    <FullLoader />
  ) : user ? (
    children
  ) : (
    <Navigate to={"/"} />
  );
}
