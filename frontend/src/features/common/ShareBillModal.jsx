import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormHelperText,
  Box,
  Badge,
  Flex,
  Text,
  useDisclosure,
  useColorModeValue,
  HStack,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import instance from "../../instance";
import { useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AiEmailAssistant from "./AiEmailAssistant";
import { HiOutlineSparkles } from "react-icons/hi2";

const stripHtml = (html) => {
  if (!html) return "";
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  } catch (e) {
    return html.replace(/<[^>]*>/g, "");
  }
};

export default function ShareBillModal({ onClose, isOpen, bill, billType }) {
  const { t, i18n } = useTranslation("common");
  const { user } = useAuth();
  const currentFeatures = user?.features || {};
  const isSmtpEnabled = currentFeatures?.smtp ?? false;
  const { orgId } = useParams();

  const defaultFields = {
    to: [],
    cc: [],
    subject: "",
    body: "",
  };
  const toast = useToast();
  const formik = useFormik({
    initialValues: defaultFields,
    onSubmit: async (values, { setSubmitting }) => {
      const language = i18n.resolvedLanguage || i18n.language || "en";
      await instance.post(
        `/api/v1/organizations/${orgId}/${billType}/${bill._id}/send`,
        values,
        {
          params: {
            lng: language,
          },
        }
      );
      toast({
        title: t("common_ui.toasts.success"),
        description: t("common_ui.share_mail.sent_to_party"),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setSubmitting(false);
      formik.resetForm(defaultFields);
      onClose();
    },
  });

  const {
    isOpen: isTemplateModalOpen,
    onOpen: onOpenTemplateModal,
    onClose: onCloseTemplateModal,
  } = useDisclosure();
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [showAiAssist, setShowAiAssist] = useState(false);

  useEffect(() => {
    if (isOpen && isSmtpEnabled) {
      (async () => {
        try {
          const { data } = await instance.get(
            `/api/v1/organizations/${orgId}/settings/templates?type=email`
          );
          const templates = data.data || [];
          setEmailTemplates(templates);
          if (templates.length > 0 && !formik.values.body) {
            const defaultEmail = templates.find(
              (t) => t.isDefault && t.type === "email"
            );
            if (defaultEmail) {
              formik.setFieldValue("body", defaultEmail.content);
            }
          }
        } catch (error) {
          console.error("Failed to fetch email templates", error);
        }
      })();
    }
  }, [isOpen, isSmtpEnabled, orgId]);

  const [contacts, setContacts] = useState([]);
  useEffect(() => {
    if (isOpen) {
      (async () => {
        const { data } = await instance.get(
          `/api/v1/organizations/${orgId}/contacts`,
          {
            params: {
              paginate: "",
              party: bill.party._id,
            },
          }
        );
        setContacts(data.data);
      })();
    }
  }, [isOpen, bill.party._id, orgId]);
  const filterContactWithEmail = (contact) => contact.email;
  const contactOptions = contacts
    .filter(filterContactWithEmail)
    .map((contact) => ({
      label: contact.name,
      value: contact._id,
    }));
  const accumulateSelectedOptions = (acc, current) => {
    acc[current] = true;
    return acc;
  };
  const selectedToOptions = formik.values.to.reduce(
    accumulateSelectedOptions,
    {}
  );
  const selectedCCOptions = formik.values.cc.reduce(
    accumulateSelectedOptions,
    {}
  );
  const filterSelectedToOptions = (contactOption) =>
    contactOption.value in selectedToOptions;
  const filterSelectedCCOptions = (contactOption) =>
    contactOption.value in selectedCCOptions;

  return (
    <Modal size={"xl"} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("common_ui.share_mail.title")}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={formik.handleSubmit}>
          <ModalBody>
            {isSmtpEnabled ? (
              <Stack spacing={1}>
                <FormControl isRequired>
                  <FormLabel>{t("common_ui.share_mail.to")}</FormLabel>
                  <Select
                    isMulti
                    onChange={(toOptions) =>
                      formik.setFieldValue(
                        "to",
                        toOptions.map((toOption) => toOption.value)
                      )
                    }
                    value={contactOptions.filter(filterSelectedToOptions)}
                    options={contactOptions}
                  />
                  <FormHelperText>
                    {t("common_ui.share_mail.contacts_with_email_only")}
                  </FormHelperText>
                </FormControl>
                <FormControl>
                  <FormLabel>{t("common_ui.share_mail.cc")}</FormLabel>
                  <Select
                    isMulti
                    onChange={(toOptions) =>
                      formik.setFieldValue(
                        "cc",
                        toOptions.map((toOption) => toOption.value)
                      )
                    }
                    value={contactOptions.filter(filterSelectedCCOptions)}
                    options={contactOptions}
                  />
                  <FormHelperText>
                    {t("common_ui.share_mail.contacts_with_email_only")}
                  </FormHelperText>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>{t("common_ui.share_mail.subject")}</FormLabel>
                  <Input
                    onChange={formik.handleChange}
                    name="subject"
                    value={formik.values.subject}
                  />
                  <FormHelperText>{t("common_ui.share_mail.subject_help")}</FormHelperText>
                </FormControl>
                <FormControl>
                  <Flex justifyContent="space-between" alignItems="center" mb={2}>
                    <FormLabel mb={0}>{t("common_ui.share_mail.message_body", { defaultValue: "Message Body" })}</FormLabel>
                    <HStack spacing={2}>
                      <Button
                        size="xs"
                        colorScheme="purple"
                        variant="ghost"
                        leftIcon={<HiOutlineSparkles />}
                        onClick={() => setShowAiAssist(!showAiAssist)}
                        isDisabled={!currentFeatures?.bot}
                      >
                        {showAiAssist ? "Hide AI Assistant" : "Draft with AI"}
                      </Button>
                      {emailTemplates.length > 0 && (
                        <Button size="xs" variant="outline" colorScheme="teal" onClick={onOpenTemplateModal}>
                          Select Template
                        </Button>
                      )}
                    </HStack>
                  </Flex>
                  <AiEmailAssistant
                    bill={bill}
                    billType={billType}
                    isBotEnabled={currentFeatures?.bot ?? false}
                    recipientNames={contacts
                      .filter((c) => formik.values.to.includes(c._id))
                      .map((c) => c.name)
                      .join(", ")}
                    onApplyDraft={(content) => formik.setFieldValue("body", content)}
                    showAiAssist={showAiAssist}
                    setShowAiAssist={setShowAiAssist}
                  />
                  <Box
                    className="quill-wrapper"
                    sx={{
                      ".ql-editor": {
                        minHeight: "150px",
                      },
                    }}
                  >
                    <ReactQuill
                      theme="snow"
                      value={formik.values.body}
                      onChange={(content) => formik.setFieldValue("body", content)}
                    />
                  </Box>
                  <FormHelperText>{t("common_ui.share_mail.body_help")}</FormHelperText>

                  <Modal isOpen={isTemplateModalOpen} onClose={onCloseTemplateModal} size="lg" isCentered>
                    <ModalOverlay />
                    <ModalContent>
                      <ModalHeader>Select Email Template</ModalHeader>
                      <ModalCloseButton />
                      <ModalBody pb={6}>
                        <Stack spacing={3}>
                          {emailTemplates.map((tpl) => (
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
                              onClick={() => {
                                formik.setFieldValue("body", tpl.content);
                                onCloseTemplateModal();
                              }}
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
                                {stripHtml(tpl.content)}
                              </Text>
                            </Box>
                          ))}
                        </Stack>
                      </ModalBody>
                    </ModalContent>
                  </Modal>
                </FormControl>
              </Stack>
            ) : (
              <Alert
                status="info"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                height="200px"
              >
                <AlertIcon boxSize="40px" mr={0} />
                <AlertTitle mt={4} mb={1} fontSize="lg">
                  {t("common_ui.table.upgrade_your_plan")}
                </AlertTitle>
                <AlertDescription maxWidth="sm">
                  {t("common_ui.share_mail.upgrade_description")}
                </AlertDescription>
              </Alert>
            )}
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              {t("common_ui.actions.close")}
            </Button>
            {isSmtpEnabled ? (
              <Button
                isLoading={formik.isSubmitting}
                type="submit"
                colorScheme="blue"
              >
                {t("common_ui.actions.share")}
              </Button>
            ) : null}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
