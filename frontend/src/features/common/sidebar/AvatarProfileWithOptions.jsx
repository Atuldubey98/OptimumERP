import {
  Flex,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { RxAvatar } from "react-icons/rx";
import { useState } from "react";
import { GoArrowSwitch } from "react-icons/go";
import { IoIosLogOut } from "react-icons/io";
import { RiLockPasswordLine } from "react-icons/ri";
import { useNavigate, useParams } from "react-router-dom";
import useAsyncCall from "../../../hooks/useAsyncCall";
import useAuth from "../../../hooks/useAuth";
import AvatarProfile from "../../common/main-layout/AvatarProfile";
import AlertModal from "../AlertModal";
import instance from "../../../instance";
export default function AvatarProfileWithOptions() {
  const { t } = useTranslation("common");
  const hoverBg = useColorModeValue("gray.200", "gray.700");
  const { requestAsyncHandler } = useAsyncCall();

  const authContext = useAuth();
  const currentPlan = authContext?.user?.currentPlan
    ? authContext?.user?.currentPlan.plan
    : "free";

  const toast = useToast();

  const [status, setStatus] = useState("idle");
  const onClickLogout = requestAsyncHandler(async () => {
    setStatus("loggingOut");
    await instance.post(`/api/v1/users/logout`);
    toast({
      title: t("common_ui.actions.logout"),
      description: t("common_ui.profile.logout_success", {
        defaultValue: "Logged out successfully",
      }),
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    navigate("/", { replace: true });
    setStatus("idle");
    if (authContext.onSetCurrentUser) authContext.onSetCurrentUser(null);
    localStorage.removeItem("organization");
  });
  const loggingOut = status === "loggingOut";
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const { orgId } = useParams();
  return (
    <Menu>
      <MenuButton
        borderRadius={"md"}
        transition={"300ms ease-in all"}
        _hover={{
          bg: hoverBg,
        }}
      >
        <Flex
          justifyContent={"center"}
          alignItems={"center"}
          w={"100%"}
          cursor={"pointer"}
          p={2}
        >
          <AvatarProfile />
        </Flex>
      </MenuButton>
      <MenuList>
        <MenuGroup title={t("common_ui.profile.profile_group")}>
          <MenuItem
            textTransform={"capitalize"}
            onClick={() => {
              navigate(`/${orgId}/profile-settings`);
            }}
            icon={<RxAvatar />}
          >
            {t("common_ui.profile.me")} ({currentPlan})
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate(`/${orgId}/profile-settings#changePasswordForm`);
            }}
            icon={<RiLockPasswordLine />}
          >
            {t("common_ui.profile.change_password")}
          </MenuItem>
          <MenuItem
            onClick={() => navigate(`/organizations`)}
            icon={<GoArrowSwitch />}
          >
            {t("common_ui.profile.switch_organization")}
          </MenuItem>
        </MenuGroup>
        <MenuDivider />
        <MenuGroup title={t("common_ui.profile.account_group")}>
          <MenuItem onClick={onOpen} icon={<IoIosLogOut />}>
            {t("common_ui.actions.logout")}
          </MenuItem>
        </MenuGroup>
      </MenuList>
      <AlertModal
        confirmDisable={loggingOut}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onClickLogout}
        body={t("common_ui.profile.logout_confirm_body")}
        header={t("common_ui.actions.logout")}
        buttonLabel={t("common_ui.actions.logout")}
      />
    </Menu>
  );
}
