import {
  Button,
  ButtonGroup,
  Flex,
  Icon,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import React from "react";
import { IoAdd, IoArrowBack } from "react-icons/io5";
import { TbTableExport } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import ButtonIcon from "./ButtonIcon";

export default function HeadingButtons({
  onAddNewItem,
  heading,
  showExport,
  isAddDisabled,
}) {
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
          <Tooltip label={isAddDisabled ? "Upgrade your plan" : ""}>
            <span>
              <ButtonIcon
                isDisabled={isAddDisabled}
                icon={<IoAdd />}
                label={"Add new"}
                onClick={onAddNewItem}
              />
            </span>
          </Tooltip>
        ) : null}
        {showExport ? (
          <Button
            colorScheme="green"
            size={"sm"}
            isLoading={showExport.status === "exporting"}
            leftIcon={<TbTableExport />}
            onClick={showExport.onExport}
          >
            Export
          </Button>
        ) : null}
      </ButtonGroup>
    </Flex>
  );
}
