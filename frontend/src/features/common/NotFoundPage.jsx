import { Box, Button, Container, Flex, Heading } from "@chakra-ui/react";
import { RiPagesLine } from "react-icons/ri";

import { useNavigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <PrivateRoute>
      <Container h={"100svh"}>
        <Flex
          height={"80%"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <RiPagesLine size={50} />
          <Heading>Page not found</Heading>
          <Box p={5}>
            <Button onClick={()=>navigate("/organizations")}>Back to organizations</Button>
          </Box>
        </Flex>
      </Container>
    </PrivateRoute>
  );
}
