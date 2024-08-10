import {
    Flex,
    Icon,
    Text
} from "@chakra-ui/react";
import React from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function BackButtonHeader(props) {
  const navigate = useNavigate();
  return (
    <Flex justifyContent={"space-between"} gap={4} alignItems={"center"}>
      <Icon cursor={"pointer"} as={IoArrowBack} onClick={() => navigate(-1)} />
      <Text noOfLines={1} fontSize={"xl"} fontWeight={"bold"}>
        {props.heading}
      </Text>
    </Flex>
  );
}
