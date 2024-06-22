import {
  Box,
  Flex,
  Heading,
  Image,
  Stack,
  Text
} from "@chakra-ui/react";
import React from "react";

export default function TourGuide({ imgSrc, label, description }) {
  return (
    <Box h={"50svh"} overflowY={"auto"}>
      <Image
        src={imgSrc}
        alt="Green double couch with wooden legs"
        borderRadius="lg"
      />
      <Stack mt="6" spacing="3">
        <Heading size="md">{label}</Heading>
        <Text>{description}</Text>
      </Stack>
    </Box>
  );
}
