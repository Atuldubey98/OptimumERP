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
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useFormik } from "formik";
import { useCallback, useEffect, useState } from "react";
import { IoAdd } from "react-icons/io5";
import * as Yup from "yup";
import useAsyncCall from "../../hooks/useAsyncCall";
import useOrganizations from "../../hooks/useOrganizations";
import instance from "../../instance";
import MainLayout from "../common/main-layout";
import BankAccounts from "./BankAccounts";
import RegisteUserDrawer from "./RegisteUserDrawer";
import HelpPopover from "../common/HelpPopover";
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
    validateOnChange: false,
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
  const bankFormik = useFormik({
    initialValues: {
      name: "",
      accountNo: "",
      ifscCode: "",
      upi: "",
      accountHolderName: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().label("Bank Name"),
      accountNo: Yup.number().label("Account Number"),
      ifscCode: Yup.string().label("IFSC Code"),
      upi: Yup.string().label("UPI Details"),
      accountHolderName: Yup.string().label("Account Holder Name"),
    }),
    onSubmit: async (data, { setSubmitting }) => {
      const { data: responseData } = await instance.patch(
        `/api/v1/organizations/${organization}`,
        {
          bank: data,
        }
      );
      toast({
        title: "Bank",
        description: responseData.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
            <FormControl>
              <FormLabel>Organization</FormLabel>
              <Select
                options={organizationsOptions}
                value={organizationsOptions.find(
                  (org) => org.value == organization
                )}
                onChange={({ value }) => {
                  setOrganization(value);
                  const currentOrg = authorizedOrgs.find(
                    (authorizedOrg) => authorizedOrg.org._id === value
                  ).org;
                  setValues(currentOrg);
                  bankFormik.setValues({
                    ...bankFormik.values,
                    ...currentOrg.bank,
                    accountNo: currentOrg.bank.accountNo || "",
                  });
                }}
              />
            </FormControl>
          </Box>
        )}
        {loading || !organization || !currentSelectedOrganization ? null : (
          <Fade in={!loading && organization}>
            <Stack marginBlock={3} spacing={1}>
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
                    <Flex
                      justifyContent={"space-between"}
                      alignItems={"center"}
                    >
                      <Heading fontSize={"lg"}>
                        Current Organization Details
                      </Heading>
                      <HelpPopover
                        title={"Organization Details"}
                        description={
                          "Here you can update your organization details"
                        }
                      />
                    </Flex>
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
                        size={"sm"}
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

              <Box
                maxW={"xl"}
                marginBlock={3}
                boxShadow={"md"}
                borderRadius={"md"}
                p={4}
              >
                <BankAccounts bankFormik={bankFormik} />
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
