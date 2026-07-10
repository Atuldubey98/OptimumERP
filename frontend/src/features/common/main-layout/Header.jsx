import {
  Badge,
  Box,
  Button,
  Flex,
  IconButton,
  Show,
  useColorMode,
  useDisclosure
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { AiOutlineDashboard } from "react-icons/ai";
import { CiDark } from "react-icons/ci";
import { IoNotificationsOutline } from "react-icons/io5";
import { MdMenu, MdOutlineWbSunny } from "react-icons/md";
import { SiQuicktime } from "react-icons/si";
import { useNavigate, useMatch } from "react-router-dom";
import AvatarProfileWithOptions from "../sidebar/AvatarProfileWithOptions";

import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import NotificationModal from "../NotificationModal";
import QuickAccessModal from "../QuickAccessModal";


export default function Header({ onSideNavOpen }) {
  const { t } = useTranslation("common");
  const { colorMode, toggleColorMode } = useColorMode();
  const { setting, fetchSetting } = useCurrentOrgCurrency();
  const navigate = useNavigate();
  const isDashboard = useMatch("/:orgId/dashboard");
  const {
    isOpen: isQuickAccessOpen,
    onClose: closeQuickAccess,
    onOpen: openQuickAccess,
  } = useDisclosure();

  const {
    isOpen: isNotificationsOpen,
    onClose: closeNotifications,
    onOpen: openNotifications,
  } = useDisclosure();

  const unReadCount = setting?.sequenceCounters?.unReadNotifications || 0;

  const onClickDashboard = () => {
    navigate(
      localStorage.getItem("organization")
        ? `/${(localStorage.getItem("organization") || "") + "/dashboard"}`
        : "/organizations"
    );
  };
  return (
    <Box width={"100%"}>
      <Box position={"relative"}>
        <Flex
          flexWrap={"wrap"}
          justifyContent={"flex-end"}
          gap={5}
          alignItems={"center"}
        >
          {
            isDashboard ? null : <>
              <Show above="xl">
                <Button
                  leftIcon={<AiOutlineDashboard />}
                  size={"sm"}
                  colorScheme="blue"
                  onClick={onClickDashboard}
                  variant="outline"
                >
                  {t("common_ui.navigation.dashboard")}
                </Button>
              </Show>
              <Show below="xl">
                <IconButton
                  size={"sm"}
                  icon={<AiOutlineDashboard />}
                  onClick={onClickDashboard}
                />
              </Show>
            </>
          }
          <Show above="xl">
            <Button
              leftIcon={<SiQuicktime />}
              size={"sm"}
              colorScheme="blue"
              onClick={openQuickAccess}
              variant="outline"
            >
              {t("common_ui.quick_access.title")}
            </Button>
          </Show>

          <Show below="xl">
            <IconButton
              size={"sm"}
              icon={<SiQuicktime />}
              onClick={openQuickAccess}
            />
          </Show>
          <Box position="relative">
            <IconButton
              size={"sm"}
              icon={<IoNotificationsOutline />}
              onClick={openNotifications}
            />
            {unReadCount > 0 && (
              <Badge
                position="absolute"
                top="-1px"
                right="-1px"
                colorScheme="red"
                borderRadius="full"
                fontSize="10px"
                px={1}
              >
                {unReadCount}
              </Badge>
            )}
          </Box>
          <IconButton
            size={"sm"}
            icon={colorMode === "dark" ? <MdOutlineWbSunny /> : <CiDark />}
            onClick={toggleColorMode}
          />

          <Show below="xl">
            <AvatarProfileWithOptions />
            <MdMenu size={28} cursor={"pointer"} onClick={onSideNavOpen} />
          </Show>
        </Flex>
      </Box>
      <QuickAccessModal isOpen={isQuickAccessOpen} onClose={closeQuickAccess} />
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={closeNotifications}
        onRefreshCount={fetchSetting}
      />
    </Box>
  );
}
