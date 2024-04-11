import {
  Button,
  ButtonGroup,
  Flex,
  Icon,
  IconButton,
  Show,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { IoAdd, IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import ButtonIcon from "./ButtonIcon";
import { TbTableExport } from "react-icons/tb";

export default function HeadingButtons({ onAddNewItem, heading, showExport }) {
  const navigate = useNavigate();
  return (
    <Flex justifyContent={"space-between"} alignItems={"center"}>
      <Flex justifyContent={"space-between"} gap={4} alignItems={"center"}>
        <Icon
          cursor={"pointer"}
          as={IoArrowBack}
          onClick={() => navigate(-1)}
        />
        <Text fontSize={"xl"} fontWeight={"bold"}>
          {heading}
        </Text>
      </Flex>
      <ButtonGroup gap="4">
        {onAddNewItem ? (
          <ButtonIcon
            icon={<IoAdd />}
            label={"Add new"}
            onClick={onAddNewItem}
          />
        ) : null}
        {showExport ? (
          <ButtonIcon
            icon={<TbTableExport />}
            label={"Export"}
            onClick={showExport}
          />
        ) : null}
      </ButtonGroup>
    </Flex>
  );
}
