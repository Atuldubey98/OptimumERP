import { useToast } from "@chakra-ui/react";
import { isAxiosError } from "axios";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useQuery from "../../hooks/useQuery";
import instance from "../../instance";
import FullLoader from "../common/FullLoader";
import PrivateRoute from "../common/PrivateRoute";
function GoogleAuth({ authenticated = false }) {
  const query = useQuery();
  const organization = localStorage.getItem("organization");
  const toast = useToast();
  const auth = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const getGoogleAuthSetup = authenticated
      ? runAdminAuthSetup
      : runUserAuthSetup;
    getGoogleAuthSetup();
  }, []);
  return <FullLoader />;

  async function runUserAuthSetup() {
    try {
      await instance.post(`/api/v1/users/googleAuth`, {
        code: query.get("code"),
        redirectUri: `${window.origin}/auth/google`,
      }); 
      await auth.fetchUserDetails();
      navigate(`/organizations`);
    } catch (error) {
      navigate("/");
    }
  }
  async function runAdminAuthSetup() {
    try {
      await instance.patch(`/api/v1/users/googleAuth`, {
        code: query.get("code"),
        redirectUri: `${window.origin}/auth/google/admin`,
      });
      await auth.fetchUserDetails();
      navigate(`/${organization}/admin`);
    } catch (error) {
      navigate(`/${organization}/admin`);
      toast({
        title: "Error",
        description: isAxiosError(error)
          ? error?.response?.data.message || "Network error occured"
          : "Network error occured",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }
}

export default function GoogleAuthPage({ authenticated = false }) {
  return authenticated ? (
    <PrivateRoute>
      <GoogleAuth authenticated={authenticated} />
    </PrivateRoute>
  ) : (
    <GoogleAuth authenticated={authenticated} />
  );
}
