import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Stack,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormHelperText,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import instance from "../../instance";
import { useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
export default function ShareBillModal({ onClose, isOpen, bill, billType }) {
  const { t } = useTranslation("common");
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
      await instance.post(
        `/api/v1/organizations/${orgId}/${billType}/${bill._id}/send`,
        values
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
  const [contacts, setContacts] = useState([]);
  const { orgId } = useParams();
  useEffect(() => {
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
  }, [bill.party._id]);
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
  const auth = useAuth();
  const isNotFree = auth?.user?.currentPlan?.plan !== "free";
  return (
    <Modal size={"xl"} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("common_ui.share_mail.title")}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={formik.handleSubmit}>
          <ModalBody>
            {isNotFree ? (
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
                  <FormLabel>{t("common_ui.share_mail.body")}</FormLabel>
                  <Textarea
                    onChange={formik.handleChange}
                    name="body"
                    value={formik.values.body}
                  />
                  <FormHelperText>{t("common_ui.share_mail.body_help")}</FormHelperText>
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
            {isNotFree ? (
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
