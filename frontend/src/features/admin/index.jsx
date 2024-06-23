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
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableCaption,
  TableContainer,
  Tabs,
  Tbody,
  Th,
  Thead,
  Tr,
  useColorModeValue,
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
  const bg = useColorModeValue("gray.100", "gray.700");
  return (
    <MainLayout>
      <Box>
        {loading ? (
          <Flex justifyContent={"center"} alignItems={"center"} marginBlock={3}>
            <Spinner />
          </Flex>
        ) : (
          <Box p={3}>
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
          </Box>
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
              <Tabs size={"sm"} isLazy>
                <TabList>
                  <Tab>Organization</Tab>
                  <Tab>Bank</Tab>
                  <Tab>Users</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <Box>
                      <form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                          <Box p={3} bg={bg}>
                            <Heading fontSize={"lg"}>
                              Current Organization Details
                            </Heading>
                          </Box>
                          <Box p={4}>
                            <Flex
                              justifyContent={"flex-end"}
                              alignItems={"center"}
                            >
                              <Button
                                size={"sm"}
                                type="submit"
                                isLoading={isSubmitting}
                                colorScheme="blue"
                              >
                                Save
                              </Button>
                            </Flex>
                            <SimpleGrid gap={3} minChildWidth={300}>
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
                            </SimpleGrid>
                          </Box>
                        </Stack>
                      </form>
                    </Box>
                  </TabPanel>
                  <TabPanel>
                    <Box>
                      <BankAccounts bankFormik={bankFormik} />
                    </Box>
                  </TabPanel>
                  <TabPanel>
                    <Box p={3} bg={bg}>
                      <Heading fontSize={"lg"}>Registered Users</Heading>
                    </Box>
                    <Box p={3}>
                      <Flex justifyContent={"flex-end"} alignItems={"center"}>
                        {organization ? (
                          <Button
                            isDisabled={
                              currentPlan === "free" ||
                              (currentPlan === "gold" && orgUsers.length >= 5)
                            }
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
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Stack>
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
