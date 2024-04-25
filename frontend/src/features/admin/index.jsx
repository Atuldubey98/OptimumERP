import {
  Box,
  Button,
  Fade,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Spinner,
  Stack,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useFormik } from "formik";
import { useCallback, useContext, useState } from "react";
import { GoOrganization } from "react-icons/go";
import { IoAdd } from "react-icons/io5";
import * as Yup from "yup";
import SettingContext from "../../contexts/SettingContext";
import useAsyncCall from "../../hooks/useAsyncCall";
import useOrganizations from "../../hooks/useOrganizations";
import instance from "../../instance";
import HelpPopover from "../common/HelpPopover";
import MainLayout from "../common/main-layout";
import BankAccounts from "./BankAccounts";
import OrgUserRow from "./OrgUserRow";
import RegisteUserDrawer from "./RegisteUserDrawer";
import useLimitsInFreePlan from "../../hooks/useLimitsInFreePlan";
import useAuth from "../../hooks/useAuth";
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
  const setting = useContext(SettingContext);
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
      fetchOrgUsers(organization);
      onClose();
      setSubmitting(false);
    }),
  });
  const fetchOrgUsers = useCallback(
    requestAsyncHandler(async (org) => {
      const { data } = await instance.get(`/api/v1/organizations/${org}/users`);
      setOrgUsers(
        data.data.map((responseData) => ({
          ...responseData.user,
          role: responseData.role,
        }))
      );
    }),
    []
  );

  const defaultOrganization = {
    name: "",
    address: "",
    gstNo: "",
    panNo: "",
    email: "",
    web: "",
    telephone: "",
  };
  const {
    values: currentSelectedOrganization,
    handleChange,
    isSubmitting,
    handleSubmit,
    setValues,
  } = useFormik({
    initialValues: defaultOrganization,
    onSubmit: async (data, { setSubmitting }) => {
      const { _id, ...restOrg } = data;
      await instance.patch(`/api/v1/organizations/${organization}`, restOrg);
      setSubmitting(false);
      toast({
        title: "Success",
        description: "Organization updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (setting.fetchSetting) setting.fetchSetting();
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
  const organizationsOptions = authorizedOrgs.map(({ org, role }) => {
    return {
      label: org.name,
      value: org._id,
      disabled: role !== "admin",
    };
  });
  const auth = useAuth();
  const currentPlan = auth?.user?.currentPlan
    ? auth?.user?.currentPlan.plan
    : "free";
  return (
    <MainLayout>
      <Box p={5}>
        {loading ? (
          <Flex justifyContent={"center"} alignItems={"center"} marginBlock={3}>
            <Spinner />
          </Flex>
        ) : (
          <FormControl>
            <FormLabel fontWeight={"bold"}>Organization</FormLabel>
            <Select
              options={organizationsOptions}
              isOptionDisabled={({ disabled }) => disabled}
              value={organizationsOptions.find(
                (org) => org.value == organization
              )}
              onChange={({ value }) => {
                setOrganization(value);
                const currentOrg = authorizedOrgs.find(
                  (authorizedOrg) => authorizedOrg.org._id === value
                ).org;
                setValues({
                  ...defaultOrganization,
                  ...currentOrg,
                });
                if (currentOrg.bank) bankFormik.setValues(currentOrg.bank);
                fetchOrgUsers(value);
              }}
            />
          </FormControl>
        )}
        {loading || !organization || !currentSelectedOrganization ? (
          <Flex
            minH={"50svh"}
            justifyContent={"center"}
            alignItems={"center"}
            flexDir={"column"}
          >
            <GoOrganization size={80} color="lightgray" />
            <Heading color={"gray.300"} fontSize={"2xl"}>
              Select Organization
            </Heading>
          </Flex>
        ) : (
          <Fade in={!loading && organization}>
            <Stack marginBlock={3} spacing={1}>
              <SimpleGrid gap={8} minChildWidth={300}>
                <Box>
                  <form onSubmit={handleSubmit}>
                    <Stack
                      marginBlock={3}
                      border={"1px"}
                      borderColor={"gray.200"}
                      boxShadow={"md"}
                      borderRadius={"md"}
                      p={4}
                      spacing={4}
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
                      <FormControl isRequired>
                        <FormLabel>Name</FormLabel>
                        <Input
                          onChange={handleChange}
                          name="name"
                          value={currentSelectedOrganization.name}
                        />
                      </FormControl>
                      <FormControl isRequired>
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
                      <FormControl isRequired>
                        <FormLabel>PAN No</FormLabel>
                        <Input
                          onChange={handleChange}
                          name="panNo"
                          value={currentSelectedOrganization.panNo}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Website</FormLabel>
                        <Input
                          type="url"
                          onChange={handleChange}
                          name="web"
                          value={currentSelectedOrganization.web}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Telephone</FormLabel>
                        <Input
                          type="tel"
                          onChange={handleChange}
                          name="telephone"
                          value={currentSelectedOrganization.telephone}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                          type="email"
                          onChange={handleChange}
                          name="email"
                          value={currentSelectedOrganization.email}
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
                <Flex justifyContent={"center"} alignItems={"center"}>
                  <Box
                    border={"1px"}
                    borderColor={"gray.200"}
                    w={"100%"}
                    marginBlock={3}
                    boxShadow={"md"}
                    borderRadius={"md"}
                    p={4}
                  >
                    <BankAccounts bankFormik={bankFormik} />
                  </Box>
                </Flex>
              </SimpleGrid>
              <Box>
                <Heading fontSize={"lg"}>Registered Users</Heading>
              </Box>
              <Flex justifyContent={"flex-end"} alignItems={"center"}>
                {organization ? (
                  <Button
                    isDisabled={currentPlan === "free" && orgUsers.length >= 5}
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
                    <Th>Active</Th>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Role</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {orgUsers.map((orgUser) => (
                    <OrgUserRow
                      fetchUsers={fetchOrgUsers}
                      organization={organization}
                      key={orgUser._id}
                      orgUser={orgUser}
                    />
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
