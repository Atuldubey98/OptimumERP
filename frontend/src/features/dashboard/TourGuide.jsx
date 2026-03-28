import {
  Box,
  Flex,
  Heading,
  Image,
  Stack,
  Text
} from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";

export default function TourGuide({ imgSrc, label, description }) {
  const { t } = useTranslation("dashboard");
  return (
    <Box h={"50svh"} overflowY={"auto"}>
      <Image
        src={imgSrc}
        alt={t("dashboard_ui.tour.image_alt")}
        borderRadius="lg"
      />
      <Stack mt="6" spacing="3">
        <Heading size="md">{label}</Heading>
        <Text>{description}</Text>
      </Stack>
    </Box>
  );
}
