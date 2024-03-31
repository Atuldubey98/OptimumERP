import {
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@chakra-ui/react";
import React from "react";
import { IoIosHelpCircleOutline } from "react-icons/io";

export default function HelpPopover({ title, description }) {
  return (
    <Popover>
      <PopoverTrigger>
        <IconButton size={"sm"} icon={<IoIosHelpCircleOutline />} />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>{title}</PopoverHeader>
        <PopoverBody>{description}</PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
