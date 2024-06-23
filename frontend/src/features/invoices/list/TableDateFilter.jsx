import {
  Box,
  Divider,
  Flex,
  FocusLock,
  Grid,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Stack,
  useDisclosure,
  useOutsideClick,
} from "@chakra-ui/react";
import SearchItem from "../../common/table-layout/SearchItem";
import DateFilter from "../../estimates/list/DateFilter";
import { CiFilter } from "react-icons/ci";
import { useRef } from "react";

export default function TableDateFilter({ dateFilter, onChangeDateFilter }) {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const filterRef = useRef(null);
  useOutsideClick({
    ref: filterRef,
    handler: onClose,
  });
  return (
    <Flex justifyContent={"flex-start"} alignItems={"center"} gap={2}>
      <Box flex={1}>
        <SearchItem placeholder="Search" />
      </Box>
      <Box ref={filterRef}>
        <Popover isOpen={isOpen} placement="bottom" closeOnBlur={false}>
          <PopoverTrigger>
            <IconButton size="sm" icon={<CiFilter />} onClick={onToggle} />
          </PopoverTrigger>
          <PopoverContent p={5}>
            <FocusLock returnFocus persistentFocus={false}>
              <PopoverArrow />
              <PopoverCloseButton onClick={onToggle} />
              <Stack spacing={2}>
                <DateFilter
                  dateFilter={dateFilter}
                  onChangeDateFilter={onChangeDateFilter}
                />
              </Stack>
            </FocusLock>
          </PopoverContent>
        </Popover>
      </Box>
    </Flex>
  );
}
