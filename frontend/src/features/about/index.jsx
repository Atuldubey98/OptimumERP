import React from "react";
import MainLayout from "../common/main-layout";
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Link,
  Text,
} from "@chakra-ui/react";
import { PiDiscordLogo } from "react-icons/pi";
import { useTranslation } from "react-i18next";
export default function AboutPage() {
  const { t } = useTranslation("common");
  return (
    
      <Box p={4}>
        <Flex
          gap={3}
          mt={6}
          justifyContent={"center"}
          flexDir={"column"}
          alignItems={"center"}
        >
          <Image w={"xs"} src="/favicon.svg" />
          <Heading fontSize={20} textAlign={"center"}>
            {t("about.heading")}
          </Heading>
          <Text>
            {t("about.distributed_by")}{" "}
            <Link href="https://github.com/Atuldubey98">Atul Dubey</Link>
          </Text>
          <Button
            colorScheme="teal"
            target="_blank"
            leftIcon={<PiDiscordLogo />}
            href="https://discord.com/invite/SHvSnXYvQF"
            as={"a"}
          >
            {t("about.join_discord")}
          </Button>
        </Flex>
      </Box>
    
  );
}
