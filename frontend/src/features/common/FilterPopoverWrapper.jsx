import {
    Box,
    FocusLock,
    IconButton,
    Popover,
    PopoverArrow,
    PopoverCloseButton,
    PopoverContent,
    PopoverTrigger,
    useDisclosure,
    useOutsideClick
} from "@chakra-ui/react";
import React, { useRef } from "react";
import { CiFilter } from "react-icons/ci";

export default function FilterPopoverWrapper({ children }) {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const filterRef = useRef(null);
  useOutsideClick({
    ref: filterRef,
    handler: onClose,
  });
  return (
    <Box ref={filterRef}>
      <Popover isOpen={isOpen} placement="bottom" closeOnBlur={false}>
        <PopoverTrigger>
          <IconButton size="sm" icon={<CiFilter />} onClick={onToggle} />
        </PopoverTrigger>
        <PopoverContent p={5}>
          <FocusLock returnFocus persistentFocus={false}>
            <PopoverArrow />
            <PopoverCloseButton onClick={onToggle} />
            {children}
          </FocusLock>
        </PopoverContent>
      </Popover>
    </Box>
  );
}
