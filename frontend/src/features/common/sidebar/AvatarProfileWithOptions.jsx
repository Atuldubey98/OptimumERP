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
import { GoArrowSwitch } from "react-icons/go";
import { IoIosLogOut } from "react-icons/io";
import { RiLockPasswordLine } from "react-icons/ri";
import AvatarProfile from "../../common/main-layout/AvatarProfile";
import { useState } from "react";
import useAuth from "../../../hooks/useAuth";
import useAsyncCall from "../../../hooks/useAsyncCall";
import AlertModal from "../AlertModal";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../api/logout";
export default function AvatarProfileWithOptions() {
  const hoverBg = useColorModeValue("gray.200", "gray.700");
  const { requestAsyncHandler } = useAsyncCall();
  const authContext = useAuth();
  const toast = useToast();
  
  const [status, setStatus] = useState("idle");
  const onClickLogout = requestAsyncHandler(async () => {
    setStatus("loggingOut");
    const { data } = await logoutUser();
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
              navigate("/profile-settings");
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
