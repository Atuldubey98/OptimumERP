import { Box, Button, Flex, useColorMode } from "@chakra-ui/react";
import React, { useState } from "react";

import AvatarProfile from "./AvatarProfile";
import ProfilePopup from "./ProfilePopup";
import { useNavigate } from "react-router-dom";
import { CiDark } from "react-icons/ci";
import { MdOutlineWbSunny } from "react-icons/md";
export default function Header() {
  const [openPopupSettings, setOpenPopupSettings] = useState(false);
  const toggleProfilePopup = () => setOpenPopupSettings(!openPopupSettings);
  const navigate = useNavigate();
  const onNavigateToOrganizations = () => navigate("/organizations");
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Box width={"100%"}>
      <Box position={"relative"}>
        <Flex justifyContent={"flex-end"} gap={5} alignItems={"center"}>
          <Button
            colorScheme="blue"
            onClick={onNavigateToOrganizations}
            variant="outline"
          >
            Switch Organization
          </Button>
          {colorMode === "dark" ? <MdOutlineWbSunny onClick={toggleColorMode} /> : <CiDark onClick={toggleColorMode}/>}
          <AvatarProfile toggleProfilePopup={toggleProfilePopup} />
        </Flex>
        {openPopupSettings ? <ProfilePopup /> : null}
      </Box>
    </Box>
  );
}
