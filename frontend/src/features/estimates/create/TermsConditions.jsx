import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  VStack,
  useDisclosure,
  useColorModeValue,
} from "@chakra-ui/react";
import TextareaAutosize from "react-textarea-autosize";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export default function TermsAndCondtions({ formik, templates = [] }) {
  const { t } = useTranslation("quote");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    if (!formik.values._id && !formik.values.terms && templates.length > 0) {
      const defaultTemplate = templates.find((t) => t.isDefault && t.type === "term");
      if (defaultTemplate) {
        formik.setFieldValue("terms", defaultTemplate.content);
      }
    }
  }, [templates, formik.values.terms, formik.values._id]);

  const handleSelectTemplate = (content) => {
    formik.setFieldValue("terms", content);
    onClose();
  };

  return (
    <FormControl isInvalid={formik.errors.terms && formik.touched.terms}>
      <Flex justifyContent="space-between" alignItems="center" mb={2}>
        <FormLabel mb={0}>{t("quote_ui.form.terms_and_conditions")}</FormLabel>
        {templates.length > 0 && (
          <Button size="xs" variant="outline" colorScheme="teal" onClick={onOpen}>
            Select Template
          </Button>
        )}
      </Flex>
      <Textarea
        as={TextareaAutosize}
        minRows={4}
        maxRows={15}
        placeholder={t("quote_ui.form.terms_placeholder")}
        name="terms"
        onChange={formik.handleChange}
        value={formik.values.terms}
        resize="none"
      />
      <FormErrorMessage>{formik.errors.terms}</FormErrorMessage>

      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Terms & Conditions Template</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={3}>
              {templates.map((tpl) => (
                <Box
                  key={tpl._id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    bg: hoverBg,
                    borderColor: "teal.400",
                  }}
                  onClick={() => handleSelectTemplate(tpl.content)}
                >
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontWeight="bold" fontSize="sm">
                      {tpl.name}
                    </Text>
                    {tpl.isDefault && (
                      <Badge colorScheme="green" variant="solid" borderRadius="md" px={1.5} py={0.5}>
                        Default
                      </Badge>
                    )}
                  </Flex>
                  <Text fontSize="xs" color="gray.500" noOfLines={3}>
                    {tpl.content}
                  </Text>
                </Box>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </FormControl>
  );
}
