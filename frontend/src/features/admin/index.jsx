import {
  Box,
  Button,
  Fade,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Spinner,
  Stack,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import * as Yup from "yup";
import useOrganizations from "../../hooks/useOrganizations";
import instance from "../../instance";
import MainLayout from "../common/main-layout";
import { Select } from "chakra-react-select";
import { useFormik } from "formik";
import { IoAdd } from "react-icons/io5";
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
  const {
    values: currentSelectedOrganization,
    handleChange,
    isSubmitting,
    handleSubmit,
    setValues,
  } = useFormik({
    initialValues: {
      name: "",
      address: "",
      gstNo: "",
      panNo: "",
    },
    onSubmit: async (data, { setSubmitting }) => {
      const { _id, ...restOrg } = data;
      await instance.patch(`/api/v1/organizations/${organization}`, restOrg);
      window.location.reload();
      setSubmitting(false);
    },
  });
  const organizationsOptions = authorizedOrgs.map(({ org }) => ({
    label: org.name,
    value: org._id,
  }));
  return (
    <MainLayout>
      <Box p={5}>
        {loading ? (
          <Flex justifyContent={"center"} alignItems={"center"} marginBlock={3}>
            <Spinner />
          </Flex>
        ) : (
          <Box>
            <Text fontStyle={"italic"}>Select your organization</Text>
            <FormControl>
              <FormLabel>Organization</FormLabel>
              <Select
                options={organizationsOptions}
                value={organizationsOptions.find(
                  (org) => org.value == organization
                )}
                onChange={({ value }) => {
                  setOrganization(value);
                  setValues(
                    authorizedOrgs.find(
                      (authorizedOrg) => authorizedOrg.org._id === value
                    ).org
                  );
                }}
              />
            </FormControl>
          </Box>
        )}
        {loading || !organization || !currentSelectedOrganization ? null : (
          <Fade in={!loading && organization}>
            <Stack marginBlock={3} spacing={1}>
              <Box>
                <Heading fontSize={"lg"}>Current Organization Details</Heading>
              </Box>
              <Box>
                <form onSubmit={handleSubmit}>
                  <Stack
                    marginBlock={3}
                    boxShadow={"md"}
                    borderRadius={"md"}
                    p={4}
                    spacing={4}
                    maxW={"xl"}
                  >
                    <FormControl>
                      <FormLabel>Name</FormLabel>
                      <Input
                        onChange={handleChange}
                        name="name"
                        value={currentSelectedOrganization.name}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Address</FormLabel>
                      <Input
                        onChange={handleChange}
                        name="address"
                        value={currentSelectedOrganization.address}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>GST No</FormLabel>
                      <Input
                        onChange={handleChange}
                        name="gstNo"
                        value={currentSelectedOrganization.gstNo}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>PAN No</FormLabel>
                      <Input
                        onChange={handleChange}
                        name="panNo"
                        value={currentSelectedOrganization.panNo}
                      />
                    </FormControl>
                    <Flex justifyContent={"center"} alignItems={"center"}>
                      <Button
                        type="submit"
                        isLoading={isSubmitting}
                        colorScheme="blue"
                      >
                        Update
                      </Button>
                    </Flex>
                  </Stack>
                </form>
              </Box>
              <Box>
                <Heading fontSize={"lg"}>Users</Heading>
              </Box>
              <Flex justifyContent={"flex-end"} alignItems={"center"}>
                {organization ? (
                  <Button
                    leftIcon={<IoAdd />}
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
            </Stack>
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
        {organization ? (
          <RegisteUserDrawer
            isOpen={isOpen}
            onClose={onClose}
            formik={formik}
          />
        ) : null}
      </Box>
    </MainLayout>
  );
}
