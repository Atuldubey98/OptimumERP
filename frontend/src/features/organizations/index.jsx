import {
  Box,
  Container,
  Flex,
  Grid,
  Spinner,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { FaRegCircleDot } from "react-icons/fa6";
import { IoAdd } from "react-icons/io5";
import useOrganizations from "../../hooks/useOrganizations";
import PrivateRoute from "../common/PrivateRoute";
import NewOrgModal from "./NewOrgModal";
import OrgItem from "./OrgItem";
import AuthContext from "../../contexts/AuthContext";
export default function OrgPage() {
  const {
    isOpen,
    onOpen: onOpenNewOrganizationModal,
    onClose: onCloseNewOrgModal,
  } = useDisclosure();
  const { authorizedOrgs, loading, fetchOrgs } = useOrganizations();
  const hoverBg = useColorModeValue("gray.200", "gray.700");
  const auth = useContext(AuthContext);
  const currentPlan = auth?.user?.currentPlan
    ? auth?.user?.currentPlan.plan
    : "free";
  return (
    <PrivateRoute>
      <Box padding={4}>
        <Container maxW={"container.md"}>
          <Flex justifyContent={"center"} gap={4} alignItems={"center"}>
            <Text fontSize={"4xl"} fontWeight={"bold"} textAlign={"center"}>
              Your organizations
            </Text>
            <FaRegCircleDot color="green" size={24} />
          </Flex>
          {loading ? (
            <Flex
              marginBlock={5}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Spinner size={"md"} />
            </Flex>
          ) : (
            <Grid gap={4} marginBlock={4}>
              {authorizedOrgs.map((authorizedOrg) => (
                <OrgItem org={authorizedOrg.org} key={authorizedOrg.org._id} />
              ))}
              {currentPlan !== "free" || !authorizedOrgs.length ? (
                <Flex
                  cursor={"pointer"}
                  _hover={{
                    backgroundColor: hoverBg,
                    transition: "all ease-in 300ms",
                  }}
                  borderRadius={4}
                  onClick={onOpenNewOrganizationModal}
                  padding={3}
                  justifyContent={"center"}
                  gap={4}
                  boxShadow={"md"}
                  alignItems={"center"}
                >
                  <IoAdd size={34} />
                </Flex>
              ) : null}
            </Grid>
          )}
        </Container>
      </Box>
      <NewOrgModal
        onCloseNewOrgModal={onCloseNewOrgModal}
        isOpen={isOpen}
        onAddedFetch={fetchOrgs}
      />
    </PrivateRoute>
  );
}
