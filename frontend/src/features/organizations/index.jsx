import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Spinner,
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
  const { t } = useTranslation("org");
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
    const { data } = await instance.post(`/api/v1/users/logout`);
    toast({
      title: "Logout",
      description: t(data.message, { defaultValue: data.message }),
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
  return (
    <SettingContextProvider>
      <AuthContextProvider>
        <PrivateRoute>
          <Box padding={4}>
            <Container maxW={"container.md"}>
              <Flex alignItems={"center"} justifyContent={"space-between"}>
                <Popover>
                  <PopoverTrigger>
                    <Button leftIcon={<CiDollar />}>{t("org_ui.page.current_plan_button")}</Button>
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
                >
                  {t("org_ui.page.logout_button")}
                </Button>
              </Flex>
              <Flex
                marginBlock={3}
                justifyContent={"center"}
                gap={4}
                alignItems={"center"}
              >
                <Heading
                  as={"h5"}
                  fontSize={"xl"}
                  fontWeight={"bold"}
                  textAlign={"center"}
                >
                  {t("org_ui.page.heading")}
                </Heading>
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
