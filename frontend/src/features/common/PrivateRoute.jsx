import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import FullLoader from './FullLoader';
export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  return loading ? (
    <FullLoader />
  ) : user ? (
    children
  ) : (
    <Navigate to={"/login"} />
  );
}
