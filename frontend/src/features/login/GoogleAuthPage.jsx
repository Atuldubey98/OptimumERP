import { Box, Flex, Spinner, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useQuery from "../../hooks/useQuery";
import instance from "../../instance";
import { isAxiosError } from "axios";
import useAuth from '../../hooks/useAuth';
export default function GoogleAuthPage() {
  const query = useQuery();
  const organization = localStorage.getItem("organization");
  const [status, setStatus] = useState("loading");
  const toast = useToast();
  const auth = useAuth();
  useEffect(() => {
    (async () => {
      try {
        setStatus("loading");
        await instance.patch(`/api/v1/users/googleAuth`, {
          code: query.get("code"),
          redirectUri: `${window.origin}/auth/google`,
        });
        await auth.fetchUserDetails();
      } catch (error) {
        toast({
          title: "Error",
          description: isAxiosError(err)
            ? err?.response?.data.message || "Network error occured"
            : "Network error occured",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setStatus("idle");
      }
    })();
  }, []);
  return (
    <Box h={"100svh"}>
      {status === "loading" ? (
        <Flex h={"100%"} justifyContent={"center"} alignItems={"center"}>
          <Spinner />
        </Flex>
      ) : (
        <Navigate to={`/${organization}/admin`} />
      )}
    </Box>
  );
}
