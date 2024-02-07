import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { Box, Flex, Spinner } from "@chakra-ui/react";
export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  return loading ? (
    <Box>
      <Flex
        justifyContent={"center"}
        height={"80svh"}
        width={"100%"}
        alignItems={"center"}
      >
        <Spinner size={"xl"} />
      </Flex>
    </Box>
  ) : user ? (
    children
  ) : (
    <Navigate to={"/login"} />
  );
}
