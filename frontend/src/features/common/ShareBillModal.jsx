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
import instance from "../../instance";
import { useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
export default function ShareBillModal({ onClose, isOpen, bill, billType }) {
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
        title: "Success",
        description: "Sent to party",
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
        <ModalHeader>Share via mail</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={formik.handleSubmit}>
          <ModalBody>
            {isNotFree ? (
              <Stack spacing={1}>
                <FormControl isRequired>
                  <FormLabel>To</FormLabel>
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
                    Only contacts of customer with email will be shown here.
                  </FormHelperText>
                </FormControl>
                <FormControl>
                  <FormLabel>CC</FormLabel>
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
                    Only contacts of customer with email will be shown here.
                  </FormHelperText>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Subject</FormLabel>
                  <Input
                    onChange={formik.handleChange}
                    name="subject"
                    value={formik.values.subject}
                  />
                  <FormHelperText>Subject for the mail</FormHelperText>
                </FormControl>
                <FormControl>
                  <FormLabel>Body</FormLabel>
                  <Textarea
                    onChange={formik.handleChange}
                    name="body"
                    value={formik.values.body}
                  />
                  <FormHelperText>Body for the mail</FormHelperText>
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
                  Upgrade your plan
                </AlertTitle>
                <AlertDescription maxWidth="sm">
                  Upgrade your plan to use this service. Contact admin to setup
                  the SMTP for organization.
                </AlertDescription>
              </Alert>
            )}
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
            {isNotFree ? (
              <Button
                isLoading={formik.isSubmitting}
                type="submit"
                colorScheme="blue"
              >
                Share
              </Button>
            ) : null}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
