import { Box, Button, Container, Flex, Heading } from "@chakra-ui/react";
import { RiPagesLine } from "react-icons/ri";
import { useTranslation } from "react-i18next";

import { useNavigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  return (
    <PrivateRoute>
      <Container h={"100svh"}>
        <Flex
          height={"80%"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <RiPagesLine size={50} />
          <Heading>{t("common_ui.not_found.page_not_found")}</Heading>
          <Box p={5}>
            <Button onClick={() => navigate("/organizations")}>
              {t("common_ui.not_found.back_to_organizations")}
            </Button>
          </Box>
        </Flex>
      </Container>
    </PrivateRoute>
  );
}
