import {
  Box,
  Button,
  Fade,
  Flex,
  FormControl,
  FormLabel,
  Select,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import * as Yup from "yup";
import useOrganizations from "../../hooks/useOrganizations";
import instance from "../../instance";
import MainLayout from "../common/main-layout";

import { useFormik } from "formik";
import useAsyncCall from "../../hooks/useAsyncCall";
import RegisteUserDrawer from "./RegisteUserDrawer";
export default function AdminPage() {
  const registerSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Min length should be 8"),
    name: Yup.string()
      .required("Name is required")
      .min(3, "Min length should be 3")
      .max(30, "Max length cannot be greater than 20"),
  });
  const { authorizedOrgs, loading } = useOrganizations();
  const [organization, setOrganization] = useState("");
  const [orgUsers, setOrgUsers] = useState([]);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { requestAsyncHandler } = useAsyncCall();
  const toast = useToast();
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
    validationSchema: registerSchema,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { data } = await instance.post(
        `/api/v1/organizations/${organization}/users`,
        values
      );
      toast({
        title: "Registered",
        description: data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchOrgUsers();
      onClose();
      setSubmitting(false);
    }),
  });
  const fetchOrgUsers = useCallback(
    requestAsyncHandler(async () => {
      const { data } = await instance.get(
        `/api/v1/organizations/${organization}/users`
      );
      setOrgUsers(
        data.data.map((responseData) => ({
          ...responseData.user,
          role: responseData.role,
        }))
      );
    }),
    [organization]
  );
  useEffect(() => {
    if (!organization) {
      setOrgUsers([]);
      return;
    }
    fetchOrgUsers();
  }, [organization]);
  return (
    <MainLayout>
      <Box p={5}>
        <Box>
          <FormControl maxW={"md"}>
            <FormLabel>Organization</FormLabel>
            <Select
              value={organization}
              onChange={(e) => setOrganization(e.currentTarget.value)}
            >
              <option value={""}>Select an organization</option>
              {authorizedOrgs.map((authorizedOrg) => (
                <option
                  disabled={authorizedOrg.role === "user"}
                  key={authorizedOrg.org._id}
                  value={authorizedOrg.org._id}
                >
                  {authorizedOrg.org.name}
                </option>
              ))}
            </Select>
          </FormControl>
          <Flex justifyContent={"flex-end"} alignItems={"center"}>
            {organization ? (
              <Button
                colorScheme="blue"
                onClick={() => {
                  formik.setValues({
                    name: "",
                    email: "",
                    password: "",
                    role: "user",
                  });
                  onOpen();
                }}
                size={"sm"}
              >
                Add new
              </Button>
            ) : null}
          </Flex>
        </Box>
        {loading || !organization ? null : (
          <Fade in={!loading && organization}>
            <TableContainer>
              <Table variant="simple">
                <TableCaption></TableCaption>
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Role</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {orgUsers.map((orgUser) => (
                    <Tr key={orgUser._id}>
                      <Td>{orgUser.name}</Td>
                      <Td>{orgUser.email}</Td>
                      <Td textTransform={"capitalize"}>{orgUser.role}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Fade>
        )}
      </Box>
      {organization ? (
        <RegisteUserDrawer isOpen={isOpen} onClose={onClose} formik={formik} />
      ) : null}
    </MainLayout>
  );
}
