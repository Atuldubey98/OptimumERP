import { Box, Flex, Spinner } from "@chakra-ui/react";
import React, { useEffect } from "react";
import instance from "../../instance";
import useQuery from "../../hooks/useQuery";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function GoogleAuthPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const auth = useAuth();
  const organization = localStorage.getItem("organization");
  useEffect(() => {
    (async () => {
      try {
        await instance.post(`/api/v1/users/googleAuth`, {
          code: query.get("code"),
          redirectUri: `${window.origin}/auth/google`,
        });
        navigate(`/${organization}/admin`);
      } catch (error) {}
    })();
  }, []);
  return (
    <Box h={"100svh"}>
      <Flex h={"100%"} justifyContent={"center"} alignItems={"center"}>
        <Spinner />
      </Flex>
    </Box>
  );
}
