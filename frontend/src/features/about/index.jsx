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
export default function AboutPage() {
  return (
    <MainLayout>
      <Box p={4}>
        <Flex
          gap={3}
          mt={6}
          justifyContent={"center"}
          flexDir={"column"}
          alignItems={"center"}
        >
          <Image w={"md"} src="/favicon-white.svg" />
          <Heading textAlign={"center"}>
            Unlock the Power of Seamless Business Operations
          </Heading>
          <Text>
            Distributed by{" "}
            <Link href="https://github.com/Atuldubey98">Atul Dubey</Link>
          </Text>
          <Button
            colorScheme="teal"
            target="_blank"
            leftIcon={<PiDiscordLogo />}
            href="https://discord.com/invite/FFWvQnqj"
            as={"a"}
          >
            Join Discord
          </Button>
        </Flex>
      </Box>
    </MainLayout>
  );
}
