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
          <HStack flexWrap={"wrap"} marginBlock={2} spacing={4}>
            {prefixes.map((prefix) => (
              <Tooltip
                key={prefix}
                label={
                  !prefix
                    ? t("common_ui.transaction_settings.default")
                    : prefix === selectedPrefix
                    ? t("common_ui.transaction_settings.current_used")
                    : undefined
                }
              >
                <Tag
                  size={"md"}
                  key={prefix}
                  variant="solid"
                  colorScheme="blue"
                >
                  <TagLabel>{prefix || t("common_ui.transaction_settings.none")}</TagLabel>
                  <TagCloseButton
                    isDisabled={!prefix || prefix === selectedPrefix}
                    onClick={() => {
                      formik.setFieldValue(
                        `prefixes.${currentSelectedPrefix}`,
                        prefixes.filter((item) => item !== prefix)
                      );
                      setError("");
                    }}
                  />
                </Tag>
              </Tooltip>
            ))}
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
