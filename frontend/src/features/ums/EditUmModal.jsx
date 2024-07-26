import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Switch,
  Textarea,
} from "@chakra-ui/react";
import React from "react";
import useUmForm from "../../hooks/useUmForm";

export default function EditUmModal({ isOpen, onClose, fetchUms }) {
  const { formik } = useUmForm({
    fetchUms,
    onClose,
  });
  return (
    <Modal
      blockScrollOnMount={false}
      size={"xl"}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{formik.values._id ? "Edit tax" : "Add tax"}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={formik.handleSubmit}>
          <ModalBody>
            <Stack spacing={2}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  required
                  name="name"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Short form</FormLabel>
                <Input
                  required
                  name="unit"
                  onChange={formik.handleChange}
                  value={formik.values.unit}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  onChange={formik.handleChange}
                  name="description"
                  value={formik.values.description}
                />
              </FormControl>
              <FormControl gap={2} display="flex" alignItems="center">
                <Switch
                  onChange={formik.handleChange}
                  name="enabled"
                  isChecked={formik.values.enabled}
                />
                <FormLabel>Enabled</FormLabel>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              isLoading={formik.isSubmitting}
              type="submit"
              colorScheme="blue"
            >
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
