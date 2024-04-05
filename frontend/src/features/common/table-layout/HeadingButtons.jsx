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

export default function HeadingButtons({ onAddNewItem, heading }) {
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
          <>
            <Show above="md">
              <Button
                leftIcon={<IoAdd />}
                onClick={onAddNewItem}
                size={"sm"}
                colorScheme="blue"
              >
                Add new
              </Button>
            </Show>
            <Show below="md">
              <IconButton
                icon={<IoAdd />}
                onClick={onAddNewItem}
                size={"sm"}
                colorScheme="blue"
              >
                Add new
              </IconButton>
            </Show>
          </>
        ) : null}
      </ButtonGroup>
    </Flex>
  );
}
