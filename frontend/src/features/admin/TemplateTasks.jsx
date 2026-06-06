import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { FiEdit, FiPlus, FiStar, FiTrash2 } from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import useTemplateTasks from "../../hooks/useTemplateTasks";
import AlertModal from "../common/AlertModal";

function TemplateFormModal({
  isOpen,
  onClose,
  formik,
  editingTemplate,
  hasReachedLimit,
}) {
  const isEmail = formik.values.type === "email";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <form onSubmit={formik.handleSubmit}>
        <ModalContent>
          <ModalHeader>
            {editingTemplate ? "Edit Template" : "Add New Template"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl
                isInvalid={formik.errors.name && formik.touched.name}
                isRequired
              >
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g. Standard Payment Terms"
                  maxLength={20}
                />
                <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl
                isInvalid={formik.errors.type && formik.touched.type}
                isRequired
              >
                <FormLabel>Type</FormLabel>
                <Select
                  name="type"
                  value={formik.values.type}
                  onChange={(e) => {
                    formik.handleChange(e);
                    formik.setFieldValue("content", "");
                  }}
                  onBlur={formik.handleBlur}
                >
                  <option value="term">Term &amp; Conditions</option>
                  <option value="email">Email Body</option>
                </Select>
                <FormErrorMessage>{formik.errors.type}</FormErrorMessage>
              </FormControl>

              <FormControl
                isInvalid={formik.errors.content && formik.touched.content}
                isRequired
              >
                <FormLabel>Content</FormLabel>
                {isEmail ? (
                  <Box
                    className="quill-wrapper"
                    sx={{
                      ".ql-editor": {
                        minHeight: "200px",
                      },
                    }}
                  >
                    <ReactQuill
                      theme="snow"
                      value={formik.values.content}
                      onChange={(content) =>
                        formik.setFieldValue("content", content)
                      }
                    />
                  </Box>
                ) : (
                  <Textarea
                    name="content"
                    value={formik.values.content}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Write template content here..."
                    rows={8}
                  />
                )}
                <FormErrorMessage>{formik.errors.content}</FormErrorMessage>
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="teal"
              isLoading={formik.isSubmitting}
              isDisabled={!editingTemplate && hasReachedLimit}
            >
              {editingTemplate ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
}

export default function TemplateTasks({ organization }) {
  const {
    templates,
    isLoading,
    editingTemplate,
    hasReachedLimit,
    formik,
    isModalOpen,
    handleEdit,
    handleAddNew,
    handleCloseModal,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
    isDeleteConfirmOpen,
    isDeleting,
    handleSetDefault,
  } = useTemplateTasks({ organization });

  return (
    <AccordionItem>
      <AccordionButton>
        <Box fontWeight={"bold"} flex="1" textAlign="left">
          Templates
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Stack spacing={4}>
          {hasReachedLimit && (
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                Limit reached. You have created the maximum number of templates
                allowed on your current plan. Please delete some or upgrade your
                plan to add more.
              </Text>
            </Alert>
          )}

          <Flex justifyContent="space-between" alignItems="center">
            <Heading
              size="xs"
              color="gray.600"
              _dark={{ color: "gray.400" }}
            >
              All custom templates
            </Heading>
            <Button
              leftIcon={<FiPlus />}
              size="sm"
              colorScheme="blue"
              onClick={handleAddNew}
              isDisabled={hasReachedLimit}
            >
              Add Template
            </Button>
          </Flex>

          {isLoading ? (
            <Flex justifyContent="center" py={6}>
              <Spinner size="md" color="teal.500" />
            </Flex>
          ) : templates.length === 0 ? (
            <Box
              py={8}
              textAlign="center"
              borderWidth="1px"
              borderStyle="dashed"
              borderRadius="md"
            >
              <Text fontSize="sm" color="gray.500">
                No templates found. Create one to get started!
              </Text>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Type</Th>
                    <Th textAlign="right">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {templates.map((tpl) => (
                    <Tr key={tpl._id}>
                      <Td fontWeight="medium">
                        <Flex alignItems="center" gap={2}>
                          {tpl.name}
                          {tpl.isDefault && (
                            <Badge colorScheme="green">Default</Badge>
                          )}
                        </Flex>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            tpl.type === "term" ? "purple" : "cyan"
                          }
                        >
                          {tpl.type === "term"
                            ? "Term & Conditions"
                            : "Email"}
                        </Badge>
                      </Td>
                      <Td textAlign="right">
                        <Flex gap={1} justifyContent="flex-end">
                          {!tpl.isDefault && (
                            <Button
                              size="xs"
                              variant="outline"
                              colorScheme="teal"
                              leftIcon={<FiStar />}
                              onClick={() =>
                                handleSetDefault(tpl._id, tpl.type)
                              }
                            >
                              Set Default
                            </Button>
                          )}
                          <IconButton
                            aria-label="Edit template"
                            icon={<FiEdit />}
                            size="xs"
                            variant="ghost"
                            onClick={() => handleEdit(tpl)}
                          />
                          <IconButton
                            aria-label="Delete template"
                            icon={<FiTrash2 />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            isDisabled={tpl.isDefault}
                            onClick={() => openDeleteConfirm(tpl._id)}
                          />
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Stack>

        <TemplateFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          formik={formik}
          editingTemplate={editingTemplate}
          hasReachedLimit={hasReachedLimit}
        />

        <AlertModal
          isOpen={isDeleteConfirmOpen}
          onClose={closeDeleteConfirm}
          header="Delete Template"
          body="Are you sure you want to delete this template? This action cannot be undone."
          onConfirm={confirmDelete}
          confirmDisable={isDeleting}
        />
      </AccordionPanel>
    </AccordionItem>
  );
}
