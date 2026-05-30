import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useFormik } from "formik";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiCpu, FiPlus, FiTrash2, FiEdit } from "react-icons/fi";
import SettingContext from "../../../contexts/SettingContext";
import useProperty from "../../../hooks/useProperty";
import instance from "../../../instance";

export default function AiProviders({ formik }) {

  const { t } = useTranslation("common");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const settingContext = useContext(SettingContext);
  const [currentSettings, setCurrentSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);

  const bg = useColorModeValue("gray.100", "gray.700");

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");

  const { value: availableProviders = [] } = useProperty("AI_PROVIDERS");
  const { value: aiModels = {} } = useProperty("AI_MODELS");

  const fetchOrgSettings = async () => {
    if (!formik.values.organization) return;
    setLoading(true);
    try {
      const { data } = await instance.get(
        `/api/v1/organizations/${formik.values.organization}/settings`
      );
      setCurrentSettings(data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch AI providers",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgSettings();
  }, [formik.values.organization]);

  const handleToggleActive = async (providerId) => {
    try {
      await instance.patch(
        `/api/v1/organizations/${formik.values.organization}/settings/ai-providers/${providerId}/active`
      );
      toast({
        title: "Success",
        description: "Active provider switched",
        status: "success",
      });
      fetchOrgSettings();
      if (settingContext.fetchSetting) {
        settingContext.fetchSetting();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch provider",
        status: "error",
      });
    }
  };

  const handleToggleDefault = async (providerId) => {
    try {
      await instance.patch(
        `/api/v1/organizations/${formik.values.organization}/settings/ai-providers/${providerId}/default`
      );
      toast({
        title: "Success",
        description: "Default provider switched successfully",
        status: "success",
      });
      fetchOrgSettings();
      if (settingContext.fetchSetting) {
        settingContext.fetchSetting();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch default provider",
        status: "error",
      });
    }
  };

  const addFormik = useFormik({
    initialValues: {
      name: "",
      provider: "",
      fields: {},
    },
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        await instance.post(
          `/api/v1/organizations/${formik.values.organization}/settings/ai-providers`,
          {
            name: values.name,
            provider: values.provider,
            fields: values.fields,
          }
        );
        toast({
          title: "Success",
          description: "AI Provider added successfully",
          status: "success",
        });
        resetForm();
        onClose();
        fetchOrgSettings();
        if (settingContext.fetchSetting) {
          settingContext.fetchSetting();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to add provider",
          status: "error",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const editFormik = useFormik({
    initialValues: {
      defaultModel: "",
    },
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await instance.patch(
          `/api/v1/organizations/${formik.values.organization}/settings/ai-providers/${editingProvider._id}/model`,
          {
            defaultModel: values.defaultModel,
          }
        );
        toast({
          title: "Success",
          description: "Default model updated successfully",
          status: "success",
        });
        onEditClose();
        fetchOrgSettings();
        if (settingContext.fetchSetting) {
          settingContext.fetchSetting();
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to update default model",
          status: "error",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (editingProvider) {
      editFormik.setFieldValue("defaultModel", editingProvider.fields?.defaultModel || "");
    }
  }, [editingProvider]);

  const handleDelete = async (providerId) => {
    try {
      await instance.delete(
        `/api/v1/organizations/${formik.values.organization}/settings/ai-providers/${providerId}`
      );
      toast({
        title: "Success",
        description: "AI Provider removed successfully",
        status: "success",
      });
      fetchOrgSettings();
      if (settingContext.fetchSetting) {
        settingContext.fetchSetting();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove provider",
        status: "error",
      });
    }
  };

  const providerOptions = availableProviders.map((p) => ({
    label: p.name,
    value: p.value,
  }));

  const providers = currentSettings?.setting?.aiProviders || [];

  return (
    <Stack spacing={4}>
      <Flex justify="space-between" align="center" bg={bg} p={3} borderRadius="md">
        <HStack spacing={3}>
          <FiCpu size={20} />
          <Heading fontSize={"lg"}>AI Providers</Heading>
        </HStack>
        <Tooltip
          label={providers.length >= 3 ? "Maximum limit of 3 AI providers reached" : ""}
          isDisabled={providers.length < 3}
        >
          <Button
            leftIcon={<FiPlus />}
            size="sm"
            colorScheme="blue"
            onClick={onOpen}
            isDisabled={!formik.values.organization || providers.length >= 3}
          >
            Add Provider
          </Button>
        </Tooltip>
      </Flex>

      <Box overflowX="auto" borderWidth="1px" borderColor={borderColor} borderRadius="lg" bg={cardBg}>
        <Table variant="simple" size="sm">
          <Thead bg={useColorModeValue("gray.50", "whiteAlpha.50")}>
            <Tr>
              <Th py={4}>Name</Th>
              <Th py={4}>Provider</Th>
              <Th py={4}>Default Model</Th>
              <Th py={4}>Default</Th>
              <Th py={4}>Active</Th>
              <Th py={4} textAlign="right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {providers.length > 0 ? (
              providers.map((provider) => (
                <Tr key={provider._id}>
                  <Td fontWeight="600">{provider.name}</Td>
                  <Td>
                    <Badge colorScheme="purple" variant="subtle">
                      {provider.provider}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme="blue" variant="outline" fontSize="xs">
                      {provider.fields?.defaultModel || "None"}
                    </Badge>
                  </Td>
                  <Td>
                    <Switch
                      colorScheme="teal"
                      isChecked={provider.isDefault}
                      onChange={() => handleToggleDefault(provider._id)}
                      isDisabled={provider.isDefault || providers.length === 1}
                    />
                  </Td>
                  <Td>
                    <Switch
                      colorScheme="blue"
                      isChecked={provider.isActive}
                      onChange={() => handleToggleActive(provider._id)}
                      isDisabled={providers.length === 1}
                    />
                  </Td>
                  <Td textAlign="right">
                    <HStack spacing={1} justify="flex-end">
                      <IconButton
                        aria-label="Edit Model"
                        icon={<FiEdit />}
                        size="xs"
                        colorScheme="teal"
                        variant="ghost"
                        onClick={() => {
                          setEditingProvider(provider);
                          onEditOpen();
                        }}
                      />
                      <IconButton
                        aria-label="Delete"
                        icon={<FiTrash2 />}
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(provider._id)}
                        isDisabled={provider.isActive}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={6} py={8} textAlign="center">
                  <Text color="gray.500">No AI providers configured yet.</Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Add Provider Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg={cardBg}>
          <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
            <HStack spacing={2}>
              <FiPlus color="blue" />
              <Text fontSize="lg">Add AI Provider</Text>
            </HStack>
          </ModalHeader>
          <ModalBody py={6}>
            <form id="add-provider-form" onSubmit={addFormik.handleSubmit}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Provider Name</FormLabel>
                  <Input
                    name="name"
                    placeholder="e.g. My Grok Service"
                    size="sm"
                    value={addFormik.values.name}
                    onChange={addFormik.handleChange}
                    borderRadius="md"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">AI Engine</FormLabel>
                  <Select
                    options={providerOptions}
                    size="sm"
                    placeholder="Select provider..."
                    value={providerOptions.find(o => o.value === addFormik.values.provider)}
                    onChange={(option) => {
                      addFormik.setFieldValue("provider", option.value);
                      addFormik.setFieldValue("fields", {});
                    }}
                    chakraStyles={{
                      control: (provided) => ({
                        ...provided,
                        borderRadius: "md",
                        fontSize: "14px"
                      }),
                    }}
                  />
                </FormControl>

                {addFormik.values.provider && (
                  <>
                    <Divider />
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                      Provider Configuration
                    </Text>
                    {availableProviders
                      .find((p) => p.value === addFormik.values.provider)
                      ?.fields?.map((field) => {
                        const fieldKey = field.label || field.value || field.name;
                        const isDefaultModel = fieldKey === "defaultModel";

                        return (
                          <FormControl key={fieldKey} isRequired>
                            <FormLabel fontSize="sm">{field.name}</FormLabel>
                            {isDefaultModel ? (
                              <Select
                                options={(aiModels[addFormik.values.provider] || []).map((m) => ({
                                  label: `${m.name} (${m.id})`,
                                  value: m.id,
                                }))}
                                size="sm"
                                placeholder="Select default model..."
                                value={(aiModels[addFormik.values.provider] || [])
                                  .map((m) => ({
                                    label: `${m.name} (${m.id})`,
                                    value: m.id,
                                  }))
                                  .find(o => o.value === addFormik.values.fields?.defaultModel)}
                                onChange={(option) => {
                                  addFormik.setFieldValue("fields.defaultModel", option.value);
                                }}
                                chakraStyles={{
                                  control: (provided) => ({
                                    ...provided,
                                    borderRadius: "md",
                                    fontSize: "14px"
                                  }),
                                }}
                              />
                            ) : (
                              <Input
                                name={`fields.${fieldKey}`}
                                type={
                                  fieldKey.toLowerCase().includes("key") ||
                                  fieldKey.toLowerCase().includes("secret")
                                    ? "password"
                                    : "text"
                                }
                                placeholder={`Enter ${(field.name || fieldKey || "value").toLowerCase()}`}
                                size="sm"
                                value={addFormik.values.fields?.[fieldKey] || ""}
                                onChange={addFormik.handleChange}
                                borderRadius="md"
                              />
                            )}
                          </FormControl>
                        );
                      })}
                  </>
                )}
              </Stack>
            </form>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
            <Button variant="ghost" mr={3} onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button
              form="add-provider-form"
              type="submit"
              colorScheme="blue"
              isLoading={addFormik.isSubmitting}
              size="sm"
              borderRadius="md"
            >
              Add Provider
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Provider Default Model Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg={cardBg}>
          <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
            <HStack spacing={2}>
              <FiEdit color="teal" />
              <Text fontSize="lg">Edit Default Model</Text>
            </HStack>
          </ModalHeader>
          <ModalBody py={6}>
            {editingProvider && (
              <form id="edit-provider-form" onSubmit={editFormik.handleSubmit}>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.500">Provider Name</FormLabel>
                    <Text fontWeight="bold" fontSize="sm">{editingProvider.name}</Text>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Default Model</FormLabel>
                    <Select
                      options={(aiModels[editingProvider.provider] || []).map((m) => ({
                        label: `${m.name} (${m.id})`,
                        value: m.id,
                      }))}
                      size="sm"
                      placeholder="Select model..."
                      value={(aiModels[editingProvider.provider] || [])
                        .map((m) => ({
                          label: `${m.name} (${m.id})`,
                          value: m.id,
                        }))
                        .find((o) => o.value === editFormik.values.defaultModel)}
                      onChange={(option) => {
                        editFormik.setFieldValue("defaultModel", option.value);
                      }}
                      chakraStyles={{
                        control: (provided) => ({
                          ...provided,
                          borderRadius: "md",
                          fontSize: "14px"
                        }),
                      }}
                    />
                  </FormControl>
                </Stack>
              </form>
            )}
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
            <Button variant="ghost" mr={3} onClick={onEditClose} size="sm">
              Cancel
            </Button>
            <Button
              form="edit-provider-form"
              type="submit"
              colorScheme="teal"
              isLoading={editFormik.isSubmitting}
              size="sm"
              borderRadius="md"
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
}
