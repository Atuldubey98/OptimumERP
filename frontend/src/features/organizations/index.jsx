import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import React, { useContext, useState } from "react";
import { CiDollar } from "react-icons/ci";
import { FaRegCircleDot } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import { IoAdd } from "react-icons/io5";
import { GoOrganization } from "react-icons/go";
import { HiOutlineSparkles } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import useAsyncCall from "../../hooks/useAsyncCall";
import useOrganizations from "../../hooks/useOrganizations";
import instance from "../../instance";
import AlertModal from "../common/AlertModal";
import PrivateRoute from "../common/PrivateRoute";
import NewOrgModal from "./NewOrgModal";
import OrgItem from "./OrgItem";
import SettingContextProvider from "../../contexts/SettingContextProvider";
import AuthContextProvider from "../../contexts/AuthContextProvider";
export default function OrgPage() {
  const { t } = useTranslation(["org", "common"]);
  const {
    isOpen,
    onOpen: onOpenNewOrganizationModal,
    onClose: onCloseNewOrgModal,
  } = useDisclosure();
  const { authorizedOrgs, loading, fetchOrgs } = useOrganizations();
  const hoverBg = useColorModeValue("gray.200", "gray.600");
  const {
    isOpen: isLogoutModalOpen,
    onOpen: openLogoutModal,
    onClose: closeLogoutModal,
  } = useDisclosure();
  const auth = useContext(AuthContext);
  const currentPlan = auth?.user?.currentPlan
    ? auth?.user?.currentPlan.plan
    : "free";
  const [status, setStatus] = useState("idle");
  const toast = useToast();
  const loggingOut = status === "loggingOut";
  const navigate = useNavigate();
  const { requestAsyncHandler } = useAsyncCall();

  const onClickLogout = requestAsyncHandler(async () => {
    setStatus("loggingOut");
    await instance.post(`/api/v1/users/logout`);
    toast({
      title: t("org_ui.page.logout_button", { defaultValue: "Logout" }),
      description: t("org_ui.logout_toast.success", {
        defaultValue: "Logged out successfully",
      }),
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    navigate("/", { replace: true });
    setStatus("idle");
    if (auth.onSetCurrentUser) auth.onSetCurrentUser(null);
    localStorage.removeItem("organization");
  });
  const plansPopup = {
    free: {
      description: t("org_ui.plan_popup.free_plan_description"),
      name: t("org_ui.plan_popup.free_plan_name"),
    },
    gold: {
      description: t("org_ui.plan_popup.gold_plan_description"),
      name: t("org_ui.plan_popup.gold_plan_name"),
    },
    platinum: {
      description: t("org_ui.plan_popup.platinum_plan_description"),
      name: t("org_ui.plan_popup.platinum_plan_name"),
    },
  };
  const popup = plansPopup[currentPlan];
  const noOfOrgs = authorizedOrgs.length;
  const isCurrentPlanAboveFree = currentPlan !== "free";
  const didUserPurchasePlan =
    auth?.user?.currentPlan?.purchasedBy === auth?.user?._id;
  const showAddOrgBtn =
    (isCurrentPlanAboveFree && noOfOrgs < 3 && didUserPurchasePlan) ||
    !noOfOrgs;
  const maxOrganizations = isCurrentPlanAboveFree && didUserPurchasePlan ? 3 : 1;
  const remainingOrganizations = Math.max(maxOrganizations - noOfOrgs, 0);
  const surfaceBg = useColorModeValue("white", "whiteAlpha.80");
  const sectionBg = useColorModeValue("blackAlpha.50", "whiteAlpha.100");
  const sectionBorder = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const subtleText = useColorModeValue("gray.600", "gray.300");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  return (
    <SettingContextProvider>
      <AuthContextProvider>
        <PrivateRoute>
          <Box padding={4}>
            <Container maxW={"container.md"}>
              <Flex
                alignItems={{ base: "stretch", md: "center" }}
                justifyContent={"space-between"}
                direction={{ base: "column", md: "row" }}
                gap={3}
              >
                <Popover>
                  <PopoverTrigger>
                    <Button leftIcon={<CiDollar />} alignSelf={{ base: "flex-start", md: "auto" }}>
                      {t("org_ui.page.current_plan_button")}
                    </Button>
                  </PopoverTrigger>
                  <Portal>
                    <PopoverContent>
                      <PopoverArrow />
                      <PopoverHeader fontWeight={"bold"}>
                        {popup.name}
                      </PopoverHeader>
                      <PopoverCloseButton />
                      <PopoverBody>{popup.description}</PopoverBody>
                    </PopoverContent>
                  </Portal>
                </Popover>
                <Button
                  onClick={openLogoutModal}
                  leftIcon={<IoIosLogOut />}
                  colorScheme="red"
                  alignSelf={{ base: "flex-start", md: "auto" }}
                >
                  {t("org_ui.page.logout_button")}
                </Button>
              </Flex>
              <Box
                mt={5}
                bg={sectionBg}
                borderWidth={1}
                borderColor={sectionBorder}
                borderRadius={"2xl"}
                px={{ base: 5, md: 6 }}
                py={{ base: 5, md: 6 }}
                boxShadow={"xl"}
              >
                <Stack spacing={5}>
                  <Flex
                    justifyContent={"space-between"}
                    alignItems={{ base: "flex-start", md: "center" }}
                    direction={{ base: "column", md: "row" }}
                    gap={4}
                  >
                    <Stack spacing={2}>
                      <Flex gap={3} alignItems={"center"} wrap={"wrap"}>
                        <Heading as={"h5"} fontSize={{ base: "xl", md: "2xl" }} fontWeight={"bold"}>
                          {t("org_ui.page.heading")}
                        </Heading>
                        <FaRegCircleDot color="green" size={18} />
                      </Flex>
                      <Text color={subtleText} maxW={"2xl"}>
                        {t("common:common_ui.organizations.subheading")}
                      </Text>
                    </Stack>
                    <Flex
                      bg={surfaceBg}
                      borderWidth={1}
                      borderColor={sectionBorder}
                      borderRadius={"xl"}
                      px={4}
                      py={3}
                      minW={{ base: "100%", md: "220px" }}
                      justifyContent={"space-between"}
                      alignItems={"center"}
                      boxShadow={"sm"}
                    >
                      <Box>
                        <Text fontSize={"xs"} textTransform={"uppercase"} letterSpacing={"widest"} color={mutedText}>
                          {t("common:common_ui.organizations.plan_label")}
                        </Text>
                        <Text fontWeight={"semibold"} textTransform={"capitalize"}>
                          {popup.name}
                        </Text>
                      </Box>
                      <Icon as={HiOutlineSparkles} boxSize={5} color={subtleText} />
                    </Flex>
                  </Flex>

                  <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
                    <Box bg={surfaceBg} borderWidth={1} borderColor={sectionBorder} borderRadius={"xl"} px={4} py={3}>
                      <Text fontSize={"xs"} textTransform={"uppercase"} letterSpacing={"widest"} color={mutedText}>
                        {t("common:common_ui.organizations.stats.organizations")}
                      </Text>
                      <Text mt={1} fontSize={"2xl"} fontWeight={"bold"}>
                        {noOfOrgs}
                      </Text>
                    </Box>
                    <Box bg={surfaceBg} borderWidth={1} borderColor={sectionBorder} borderRadius={"xl"} px={4} py={3}>
                      <Text fontSize={"xs"} textTransform={"uppercase"} letterSpacing={"widest"} color={mutedText}>
                        {t("common:common_ui.organizations.stats.remaining")}
                      </Text>
                      <Text mt={1} fontSize={"2xl"} fontWeight={"bold"}>
                        {remainingOrganizations}
                      </Text>
                    </Box>
                    <Box bg={surfaceBg} borderWidth={1} borderColor={sectionBorder} borderRadius={"xl"} px={4} py={3}>
                      <Text fontSize={"xs"} textTransform={"uppercase"} letterSpacing={"widest"} color={mutedText}>
                        {t("common:common_ui.organizations.stats.quick_action")}
                      </Text>
                      <Text mt={1} fontSize={"sm"} fontWeight={"semibold"} lineHeight={1.4}>
                        {showAddOrgBtn
                          ? t("common:common_ui.organizations.quick_action.add")
                          : t("common:common_ui.organizations.quick_action.manage")}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Stack>
              </Box>
              {loading ? (
                <Flex
                  marginBlock={5}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Spinner size={"md"} />
                </Flex>
              ) : (
                <Box mt={6}>
                  <Flex justifyContent={"space-between"} alignItems={{ base: "flex-start", md: "center" }} gap={3} mb={4} direction={{ base: "column", md: "row" }}>
                    <Box>
                      <Text fontSize={"lg"} fontWeight={"bold"}>
                        {t("common:common_ui.organizations.list_heading")}
                      </Text>
                      <Text fontSize={"sm"} color={subtleText}>
                        {t("common:common_ui.organizations.list_subheading")}
                      </Text>
                    </Box>
                    <Text fontSize={"sm"} color={mutedText}>
                      {t("common:common_ui.organizations.list_count", {
                        count: noOfOrgs,
                      })}
                    </Text>
                  </Flex>
                <Grid gap={4} marginBlock={4}>
                  {authorizedOrgs.map((authorizedOrg) => (
                    <OrgItem
                      org={authorizedOrg.org}
                      key={authorizedOrg.org._id}
                    />
                  ))}
                  {showAddOrgBtn ? (
                    <Flex
                      cursor={"pointer"}
                      _hover={{
                        backgroundColor: hoverBg,
                        transition: "all ease-in 300ms",
                        transform: "translateY(-1px)",
                      }}
                      bg={surfaceBg}
                      borderWidth={1}
                      borderColor={sectionBorder}
                      borderRadius={"xl"}
                      onClick={onOpenNewOrganizationModal}
                      padding={{ base: 4, md: 5 }}
                      justifyContent={"flex-start"}
                      gap={4}
                      boxShadow={"md"}
                      alignItems={"center"}
                    >
                      <Flex
                        borderRadius={"full"}
                        borderWidth={1}
                        borderColor={sectionBorder}
                        w={12}
                        h={12}
                        alignItems={"center"}
                        justifyContent={"center"}
                        flexShrink={0}
                      >
                        <IoAdd size={24} />
                      </Flex>
                      <Box>
                        <Text fontWeight={"bold"}>
                          {t("common:common_ui.organizations.add_card.heading")}
                        </Text>
                        <Text fontSize={"sm"} color={subtleText}>
                          {t("common:common_ui.organizations.add_card.body")}
                        </Text>
                      </Box>
                    </Flex>
                  ) : null}
                </Grid>
                </Box>
              )}
            </Container>
          </Box>
          <NewOrgModal
            onCloseNewOrgModal={onCloseNewOrgModal}
            isOpen={isOpen}
            onAddedFetch={fetchOrgs}
          />
          <AlertModal
            confirmDisable={loggingOut}
            isOpen={isLogoutModalOpen}
            onClose={closeLogoutModal}
            onConfirm={onClickLogout}
            body={t("org_ui.logout_modal.body")}
            header={t("org_ui.logout_modal.header")}
            buttonLabel={t("org_ui.logout_modal.confirm_button")}
          />
        </PrivateRoute>
      </AuthContextProvider>
    </SettingContextProvider>
  );
}
