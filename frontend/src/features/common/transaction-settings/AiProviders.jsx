import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Text,
  Badge,
  HStack,
  Divider,
  Switch,
  Tooltip,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useFormik } from "formik";
import { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { FiPlus, FiTrash2, FiCpu, FiKey } from "react-icons/fi";
import instance from "../../../instance";
import useProperty from "../../../hooks/useProperty";
import SettingContext from "../../../contexts/SettingContext";

export default function AiProviders({ formik }) {
  const { t } = useTranslation("common");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const settingContext = useContext(SettingContext);
  const [currentSettings, setCurrentSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  const bg = useColorModeValue("gray.100", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");

  const { value: availableProviders = [] } = useProperty("AI_PROVIDERS");

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
              <Th py={4}>API Key</Th>
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
                    <HStack spacing={2}>
                      <FiKey size={12} color="gray" />
                      <Text color="gray.500" fontSize="xs">********************</Text>
                    </HStack>
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
                    <IconButton
                      aria-label="Delete"
                      icon={<FiTrash2 />}
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDelete(provider._id)}
                      isDisabled={provider.isActive}
                    />
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={5} py={8} textAlign="center">
                  <Text color="gray.500">No AI providers configured yet.</Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

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
                      // Reset fields when provider changes
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
                      ?.fields?.map((field) => (
                        <FormControl key={field.label || field.value} isRequired>
                          <FormLabel fontSize="sm">{field.name}</FormLabel>
                          <Input
                            name={`fields.${field.label || field.value}`}
                            type={
                              (field.label || field.value).toLowerCase().includes("key") || 
                              (field.label || field.value).toLowerCase().includes("secret") 
                                ? "password" 
                                : "text"
                            }
                            placeholder={`Enter ${field.name.toLowerCase()}`}
                            size="sm"
                            value={addFormik.values.fields?.[field.label || field.value] || ""}
                            onChange={addFormik.handleChange}
                            borderRadius="md"
                          />
                        </FormControl>
                      ))}
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
    </Stack>
  );
}
