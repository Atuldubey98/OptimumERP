import {
    Box,
    FocusLock,
    IconButton,
    Popover,
    PopoverArrow,
    PopoverCloseButton,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
    useDisclosure,
    useOutsideClick,
    Text,
    HStack,
} from "@chakra-ui/react";
import React, { useRef } from "react";
import { CiFilter } from "react-icons/ci";
import { useTranslation } from "react-i18next";

export default function FilterPopoverWrapper({ children, title }) {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const filterRef = useRef(null);
  const { t } = useTranslation("common");

  useOutsideClick({
    ref: filterRef,
    handler: onClose,
  });

  return (
    <Box ref={filterRef}>
      <Popover 
        isOpen={isOpen} 
        placement="bottom-end" 
        closeOnBlur={false}
        isLazy
      >
        <PopoverTrigger>
          <IconButton 
            size="sm" 
            icon={<CiFilter size={20} />} 
            onClick={onToggle}
            colorScheme={isOpen ? "blue" : "gray"}
            variant={isOpen ? "solid" : "outline"}
            aria-label="Toggle Filters"
          />
        </PopoverTrigger>
        <PopoverContent 
          p={0} 
          boxShadow="xl" 
          width={{ base: "100vw", sm: "320px" }} 
          maxW="100vw"
          borderRadius="lg"
          overflow="hidden"
        >
          <FocusLock returnFocus persistentFocus={false}>
            <PopoverHeader borderBottomWidth="1px" py={3} px={4}>
              <HStack justify="space-between">
                <Text fontWeight="600" fontSize="sm">
                  {title || t("common_ui.filters")}
                </Text>
                <PopoverCloseButton position="static" size="sm" onClick={onToggle} />
              </HStack>
            </PopoverHeader>
            <Box p={4}>
              {children}
            </Box>
          </FocusLock>
        </PopoverContent>
      </Popover>
    </Box>
  );
}
