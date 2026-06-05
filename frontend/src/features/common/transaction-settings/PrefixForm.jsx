import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  InputGroup,
  Input,
  InputRightElement,
  Button,
  FormControl,
  FormErrorMessage,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  Tooltip,
  Box,
  Text,
} from "@chakra-ui/react";

export default function PrefixForm({
  isOpen,
  onClose,
  formik,
  currentSelectedPrefix,
}) {
  const { t } = useTranslation("common");
  const [prefix, setPrefix] = useState("");
  const [error, setError] = useState("");
  const prefixes = formik.values.prefixes[currentSelectedPrefix] || [];
  const selectedPrefix = formik.values[currentSelectedPrefix];
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("common_ui.transaction_settings.prefix_list")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isInvalid={error}>
            <InputGroup size="md">
              <Input
                pr="4.5rem"
                placeholder={t("common_ui.transaction_settings.prefix")}
                onChange={(e) => {
                  setPrefix(e.currentTarget.value);
                  setError("");
                }}
                value={prefix}
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  size="sm"
                  onClick={() => {
                    if (prefixes.includes(prefix)) {
                      setError(t("common_ui.transaction_settings.already_exists"));
                      return;
                    }
                    formik.setFieldValue(`prefixes.${currentSelectedPrefix}`, [
                      prefix,
                      ...prefixes,
                    ]);
                    setError("");
                    setPrefix("");
                  }}
                >
                  {t("common_ui.actions.add")}
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{error}</FormErrorMessage>
          </FormControl>

          {prefixes.length > 0 && (
            <Box mt={4} mb={2}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500">
                {t("common_ui.transaction_settings.prefix_instruction", "Tip: Click on any prefix below to set it as the default/active prefix.")}
              </Text>
            </Box>
          )}

          <HStack flexWrap={"wrap"} marginBlock={2} spacing={4}>
            {prefixes.map((prefix) => {
              const isActive = prefix === selectedPrefix;
              return (
                <Tooltip
                  key={prefix}
                  label={
                    isActive
                      ? t("common_ui.transaction_settings.current_used")
                      : t("common_ui.transaction_settings.click_to_select", "Click to set as active default prefix")
                  }
                >
                  <Tag
                    size={"md"}
                    key={prefix}
                    variant={isActive ? "solid" : "outline"}
                    colorScheme={isActive ? "blue" : "gray"}
                    cursor="pointer"
                    onClick={() => {
                      formik.setFieldValue(currentSelectedPrefix, prefix);
                    }}
                    _hover={{
                      borderColor: "blue.500",
                      bg: isActive ? "blue.600" : "blue.50",
                    }}
                    transition="all 0.2s"
                  >
                    <TagLabel fontWeight={isActive ? "bold" : "normal"}>
                      {prefix || t("common_ui.transaction_settings.none")}
                    </TagLabel>
                    <TagCloseButton
                      isDisabled={!prefix || isActive}
                      onClick={(e) => {
                        e.stopPropagation();
                        formik.setFieldValue(
                          `prefixes.${currentSelectedPrefix}`,
                          prefixes.filter((item) => item !== prefix)
                        );
                        setError("");
                      }}
                    />
                  </Tag>
                </Tooltip>
              );
            })}
          </HStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            {t("common_ui.actions.close")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
