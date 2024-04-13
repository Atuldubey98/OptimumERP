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
    const { data } = await instance.post(`/api/v1/users/logout`);
    toast({
      title: "Logout",
      description: data.message,
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
        <MenuGroup title="Profile">
          <MenuItem
            onClick={() => {
              navigate(`/${orgId}/profile-settings`);
            }}
            icon={<RxAvatar />}
          >
            Me ({currentPlan})
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate(`/${orgId}/profile-settings#changePasswordForm`);
            }}
            icon={<RiLockPasswordLine />}
          >
            Change password
          </MenuItem>
          <MenuItem
            onClick={() => navigate(`/organizations`)}
            icon={<GoArrowSwitch />}
          >
            Switch Organization
          </MenuItem>
        </MenuGroup>
        <MenuDivider />
        <MenuGroup title="Acccount">
          <MenuItem onClick={onOpen} icon={<IoIosLogOut />}>
            Logout
          </MenuItem>
        </MenuGroup>
      </MenuList>
      <AlertModal
        confirmDisable={loggingOut}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onClickLogout}
        body={"Do you want to logout ?"}
        header={"Logout"}
        buttonLabel="Logout"
      />
    </Menu>
  );
}
