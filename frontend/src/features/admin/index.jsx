import {
  Box,
  Button,
  Fade,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Image,
  Input,
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
import { useCallback, useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { GoOrganization } from "react-icons/go";
import { IoAdd } from "react-icons/io5";
import * as Yup from "yup";
import SettingContext from "../../contexts/SettingContext";
import useAsyncCall from "../../hooks/useAsyncCall";
import useAuth from "../../hooks/useAuth";
import useOrganizations from "../../hooks/useOrganizations";
import instance from "../../instance";
import MainLayout from "../common/main-layout";
import AdminTasks from "./AdminTasks";
import BankAccounts from "./BankAccounts";
import CurrentOrgDetailsForm from "./CurrentOrgDetailsForm";
import OrgUserRow from "./OrgUserRow";
import RegisteUserDrawer from "./RegisteUserDrawer";
import HelpPopover from "../common/HelpPopover";
import AdminLayout from "../common/auth-layout/AdminLayout";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { MdDelete, MdOutlineFileUpload } from "react-icons/md";
import useStorageUtil from "../../hooks/useStorageUtil";
export default function AdminPage() {
  const { t } = useTranslation("admin");
  const {t : tCommon} = useTranslation("common");
  const registerSchema = Yup.object({
    email: Yup.string()
      .email(t("validation.invalid_email"))
      .required(t("validation.email_required")),
    password: Yup.string()
      .required(t("validation.password_required"))
      .min(8, t("validation.password_min")),
    name: Yup.string()
      .required(t("validation.name_required"))
      .min(3, t("validation.name_min"))
      .max(30, t("validation.name_max")),
  });
  const { authorizedOrgs, loading, fetchOrgs } = useOrganizations();
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
      useAdminSMTP: false,
    },
    validateOnChange: false,
    validationSchema: registerSchema,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { data } = await instance.post(
        `/api/v1/organizations/${organization}/users`,
        values,
      );
      toast({
        title: t("toasts.registered_title"),
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
        })),
      );
    }),
    [],
  );

  const defaultOrganization = {
    name: "",
    address: "",
    gstNo: "",
    panNo: "",
    email: "",
    web: "",
    telephone: "",
    logo: "",
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
        title: t("toasts.success_title"),
        description: t("toasts.organization_updated"),
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
      name: Yup.string().label(t("bank.bank_name")),
      accountNo: Yup.number().label(t("bank.account_number")),
      ifscCode: Yup.string().label(t("bank.ifsc_code")),
      upi: Yup.string().label(t("bank.upi_details")),
      accountHolderName: Yup.string().label(t("bank.account_holder_name")),
    }),
    onSubmit: async (data, { setSubmitting }) => {
      await instance.patch(
        `/api/v1/organizations/${organization}`,
        {
          bank: data,
        },
      );
      toast({
        title: t("toasts.bank_title"),
        description: tCommon("api.bank_details_updated"),
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
  const orgName = currentSelectedOrganization?.name;
  const { getFileUrl } = useStorageUtil();
  const logo = getFileUrl(currentSelectedOrganization?.logo);
  const logoInputRef = useRef(null);
  const [logoStatus, setLogoStatus] = useState("idle");
  return (
    <MainLayout>
      <AdminLayout>
        <Box>
          {loading ? (
            <Flex
              p={4}
              justifyContent={"center"}
              alignItems={"center"}
              marginBlock={3}
            >
              <Spinner />
            </Flex>
          ) : (
            <Box p={3}>
              <FormControl>
                <FormLabel fontWeight={"bold"}>
                  {t("organization.label")}
                </FormLabel>
                <Select
                  options={organizationsOptions}
                  isOptionDisabled={({ disabled }) => disabled}
                  value={organizationsOptions.find(
                    (org) => org.value == organization,
                  )}
                  onChange={({ value }) => {
                    setOrganization(value);
                    const currentOrg = authorizedOrgs.find(
                      (authorizedOrg) => authorizedOrg.org._id === value,
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
                {t("organization.select_prompt")}
              </Heading>
            </Flex>
          ) : (
            <Fade in={!loading && organization}>
              <Stack spacing={1}>
                <Tabs size={"sm"} isLazy>
                  <TabList>
                    <Tab>{t("tabs.organization")}</Tab>
                    <Tab>{t("tabs.users")}</Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel>
                      <Stack spacing={2}>
                        <Stack spacing={2}>
                          <Box bg={bg} p={2}>
                            <Heading fontSize={"lg"}>
                              {t("organization.information_heading")}
                            </Heading>
                          </Box>
                          <Accordion allowToggle>
                            <AccordionItem>
                              <h2>
                                <AccordionButton>
                                  <Box
                                    fontWeight={"bold"}
                                    flex="1"
                                    textAlign="left"
                                  >
                                    {t("organization.details")}
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                              </h2>
                              <AccordionPanel pb={4}>
                                <CurrentOrgDetailsForm
                                  currentSelectedOrganization={
                                    currentSelectedOrganization
                                  }
                                  handleChange={handleChange}
                                  handleSubmit={handleSubmit}
                                  isSubmitting={isSubmitting}
                                />
                              </AccordionPanel>
                            </AccordionItem>

                            <AccordionItem>
                              <h2>
                                <AccordionButton>
                                  <Box
                                    flex="1"
                                    fontWeight={"bold"}
                                    textAlign="left"
                                  >
                                    {t("organization.change_logo")}
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                              </h2>
                              <AccordionPanel pb={4}>
                                <Flex
                                  gap={3}
                                  justifyContent={"flex-start"}
                                  alignItems={"center"}
                                >
                                  <Box
                                    p={2}
                                    borderRadius={"md"}
                                    border={"1px solid lightgray"}
                                  >
                                    {logo ? (
                                      <Image
                                        width={50}
                                        src={logo}
                                        alt={orgName}
                                      />
                                    ) : (
                                      <GoOrganization size={50} />
                                    )}
                                  </Box>
                                  <Input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      setLogoStatus("uploading");
                                      const file = e.currentTarget.files[0];
                                      if (!file) return;
                                      const form = new FormData();
                                      form.append("logo", file);
                                      await instance.post(
                                        `/api/v1/organizations/${organization}/logo`,
                                        form,
                                        {
                                          headers: {
                                            "Content-Type":
                                              "multipart/form-data",
                                          },
                                        },
                                      );
                                      setting.fetchSetting();
                                      fetchOrgs();
                                      setOrganization(null);
                                      setLogoStatus("idle");
                                    }}
                                    display={"none"}
                                  />
                                  <IconButton
                                    size={"sm"}
                                    colorScheme="yellow"
                                    isLoading={logoStatus === "uploading"}
                                    icon={<MdOutlineFileUpload />}
                                    onClick={() => logoInputRef.current.click()}
                                  />
                                  {logo && (
                                    <IconButton
                                      size={"sm"}
                                      colorScheme="red"
                                      variant={"outline"}
                                      isLoading={logoStatus === "deleting"}
                                      icon={<MdDelete />}
                                      onClick={async () => {
                                        setLogoStatus("deleting");
                                        await instance.delete(
                                          `/api/v1/organizations/${organization}/logo`,
                                        );
                                        setting.fetchSetting();
                                        fetchOrgs();
                                        setOrganization(null);
                                        setLogoStatus("idle");
                                      }}
                                    />
                                  )}
                                </Flex>
                              </AccordionPanel>
                            </AccordionItem>
                          </Accordion>
                        </Stack>
                        <Box>
                          <BankAccounts bankFormik={bankFormik} />
                        </Box>
                        <Box>
                          <AdminTasks organization={organization} />
                        </Box>
                      </Stack>
                    </TabPanel>

                    <TabPanel>
                      <Box p={3} bg={bg}>
                        <Heading fontSize={"lg"}>
                          {t("users.registered_heading")}
                        </Heading>
                      </Box>

                      <Box pt={2}>
                        <Flex
                          justifyContent={"space-between"}
                          alignItems={"center"}
                        >
                          <HelpPopover
                            title={t("users.help_title")}
                            description={
                              t("users.help_description")
                            }
                          />
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
                                  useAdminSMTP: false,
                                });
                                onOpen();
                              }}
                              size={"sm"}
                            >
                              {t("users.add_new")}
                            </Button>
                          ) : null}
                        </Flex>
                        <TableContainer>
                          <Table variant="simple">
                            <TableCaption></TableCaption>
                            <Thead>
                              <Tr>
                                <Th>{t("users.table.active")}</Th>
                                <Th>{t("users.table.name")}</Th>
                                <Th>{t("users.table.email")}</Th>
                                <Th>{t("users.table.role")}</Th>
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
      </AdminLayout>
    </MainLayout>
  );
}
