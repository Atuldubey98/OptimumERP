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
  Checkbox,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useFormik } from "formik";
import { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { FiPlus, FiTrash2, FiMail, FiKey } from "react-icons/fi";
import instance from "../../../instance";
import useProperty from "../../../hooks/useProperty";
import SettingContext from "../../../contexts/SettingContext";

export default function SmtpProviders({ formik }) {
  const { t } = useTranslation("common");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const settingContext = useContext(SettingContext);
  const [currentSettings, setCurrentSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  const bg = useColorModeValue("gray.100", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");

  const { value: availableProviders = [] } = useProperty("SMTP_PROVIDERS");

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
        description: "Failed to fetch SMTP providers",
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
        `/api/v1/organizations/${formik.values.organization}/settings/smtp-providers/${providerId}/active`
      );
      toast({
        title: "Success",
        description: "Active SMTP provider switched",
        status: "success",
      });
      fetchOrgSettings();
      if (settingContext.fetchSetting) {
        settingContext.fetchSetting();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch SMTP provider",
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
          `/api/v1/organizations/${formik.values.organization}/settings/smtp-providers`,
          {
            name: values.name,
            provider: values.provider,
            fields: values.fields,
          }
        );
        toast({
          title: "Success",
          description: "SMTP Provider added successfully",
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
          description: error.response?.data?.message || "Failed to add SMTP provider",
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
        `/api/v1/organizations/${formik.values.organization}/settings/smtp-providers/${providerId}`
      );
      toast({
        title: "Success",
        description: "SMTP Provider removed successfully",
        status: "success",
      });
      fetchOrgSettings();
      if (settingContext.fetchSetting) {
        settingContext.fetchSetting();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove SMTP provider",
        status: "error",
      });
    }
  };

  const providerOptions = availableProviders.map((p) => ({
    label: p.name,
    value: p.provider,
  }));

  
  const providers = currentSettings?.setting?.smtpProviders || [];

  return (
    <Stack spacing={4}>
      <Flex justify="space-between" align="center" bg={bg} p={3} borderRadius="md">
        <HStack spacing={3}>
          <FiMail size={20} />
          <Heading fontSize={"lg"}>SMTP Providers</Heading>
        </HStack>
        <Tooltip 
          label={providers.length >= 3 ? "Maximum limit of 3 SMTP providers reached" : ""}
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
              <Th py={4}>Engine</Th>
              <Th py={4}>User/Email</Th>
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
                    <Badge colorScheme="green" variant="subtle">
                      {provider.provider}
                    </Badge>
                  </Td>
                  <Td>{provider.fields?.user}</Td>
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
                  <Text color="gray.500">No SMTP providers configured yet. Using system default.</Text>
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
              <Text fontSize="lg">Add SMTP Provider</Text>
            </HStack>
          </ModalHeader>
          <ModalBody py={6}>
            <form id="add-smtp-form" onSubmit={addFormik.handleSubmit}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Configuration Name</FormLabel>
                  <Input
                    name="name"
                    placeholder="e.g. Sales Team Gmail"
                    size="sm"
                    value={addFormik.values.name}
                    onChange={addFormik.handleChange}
                    borderRadius="md"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">SMTP Engine</FormLabel>
                  <Select
                    options={providerOptions}
                    size="sm"
                    placeholder="Select engine..."
                    value={providerOptions.find(o => o.value === addFormik.values.provider)}
                    onChange={(option) => {
                      addFormik.setFieldValue("provider", option.value);
                      const provider = availableProviders.find(p => p.provider === option.value);
                      const initialFields = {};
                      provider?.fields?.forEach(f => {
                          initialFields[f.name] = f.default !== undefined ? f.default : "";
                      });
                      addFormik.setFieldValue("fields", initialFields);
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
                      Authentication & Server Settings
                    </Text>
                    {availableProviders
                      .find((p) => p.provider === addFormik.values.provider)
                      ?.fields?.map((field) => (
                        <FormControl key={field.name} isRequired>
                          {field.type !== "boolean" && (
                            <FormLabel fontSize="sm">{field.label}</FormLabel>
                          )}
                          {field.type === "boolean" ? (
                              <Checkbox
                                isChecked={addFormik.values.fields?.[field.name] || false}
                                onChange={(e) => addFormik.setFieldValue(`fields.${field.name}`, e.target.checked)}
                              >
                                {field.label}
                              </Checkbox>
                          ) : (
                              <Input
                                name={`fields.${field.name}`}
                                type={field.type}
                                placeholder={`Enter ${(field.label || "value").toLowerCase()}`}
                                size="sm"
                                value={addFormik.values.fields?.[field.name] || ""}
                                onChange={(e) => {
                                    const val = field.type === "number" ? Number(e.target.value) : e.target.value;
                                    addFormik.setFieldValue(`fields.${field.name}`, val);
                                }}
                                borderRadius="md"
                              />
                          )}
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
              form="add-smtp-form"
              type="submit"
              colorScheme="blue"
              isLoading={addFormik.isSubmitting}
              size="sm"
              borderRadius="md"
            >
              Add SMTP Provider
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
}
