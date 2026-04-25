import {
  Box,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Text,
  useDisclosure,
  useToast,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { GoPeople } from "react-icons/go";
import { FiPackage } from "react-icons/fi";
import instance from "../../instance";

export function GenericImportModal({ 
  organization, 
  isOpen, 
  onClose, 
  endpoint, 
  modalTitle, 
  uploadHelp, 
  sampleCols, 
  sampleFileName 
}) {
  const { t } = useTranslation("admin");
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDownloadSample = () => {
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(sampleCols);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", sampleFileName);
    link.click();
    toast({
      title: t("tasks.import.download_started"),
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const onUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: t("tasks.import.no_file_selected"),
        description: t("tasks.import.select_csv_prompt"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await instance.post(
        `/api/v1/organizations/${organization}/${endpoint}/import`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      toast({
        title: t("tasks.import.success_title"),
        description: response.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error.response?.data?.message || "An error occurred during import",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <form onSubmit={onUpload}>
        <ModalContent>
          <ModalHeader>{modalTitle}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                {t("tasks.import.download_help")}
              </Text>
              <Button onClick={handleDownloadSample} variant="outline" size="sm">
                {t("tasks.import.download_sample")}
              </Button>
              <Box borderTopWidth="1px" pt={4}>
                <Text fontWeight="bold" mb={2}>{t("tasks.import.submit")}</Text>
                <Text fontSize="xs" mb={3} color="gray.500">
                  {uploadHelp}
                </Text>
                <Input
                  onChange={(e) => {
                    setFile(e.currentTarget.files[0]);
                  }}
                  type="file"
                  accept=".csv"
                  p={1}
                  size="sm"
                  placeholder={t("tasks.import.select_csv_placeholder")}
                />
              </Box>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} size="sm">
              {t("actions.cancel")}
            </Button>
            <Button type="submit" colorScheme="blue" isLoading={isUploading} size="sm">
              {t("tasks.import.submit")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
}

export default function ImportTasks({ organization }) {
  const { t } = useTranslation("admin");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [importConfig, setImportConfig] = useState(null);
  const bg = useColorModeValue("gray.100", "gray.700");

  const openImport = (type) => {
    const configs = {
      party: {
        type: "party",
        endpoint: "parties",
        modalTitle: t("tasks.import.modal_title_party"),
        uploadHelp: t("tasks.import.upload_help_party"),
        sampleCols: `Name,"Billing Address","Shipping Address","GST No","PAN No"`,
        sampleFileName: "party_sample.csv"
      },
      product: {
        type: "product",
        endpoint: "products",
        modalTitle: t("tasks.import.modal_title_product"),
        uploadHelp: t("tasks.import.upload_help_product"),
        sampleCols: `Name,"Code","Type","Cost Price","Selling Price","Unit","Description"`,
        sampleFileName: "product_sample.csv"
      }
    };
    setImportConfig(configs[type]);
    onOpen();
  };

  return (
    <Box pt={2}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box 
          p={6} 
          borderWidth="1px" 
          borderRadius="lg" 
          bg="white" 
          _dark={{ bg: "gray.800" }}
          shadow="sm"
          _hover={{ shadow: "md", transform: "translateY(-2px)" }}
          transition="all 0.2s"
          cursor="pointer"
          onClick={() => openImport("party")}
        >
          <Stack align="center" spacing={3}>
            <Box p={3} borderRadius="full" bg="blue.50" color="blue.500" _dark={{ bg: "blue.900", color: "blue.200" }}>
              <GoPeople size={24} />
            </Box>
            <Heading size="md">{t("tasks.import.party")}</Heading>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              {t("tasks.import.upload_help_party")}
            </Text>
            <Button colorScheme="blue" variant="ghost" size="sm">
              {t("tasks.import.submit")}
            </Button>
          </Stack>
        </Box>

        <Box 
          p={6} 
          borderWidth="1px" 
          borderRadius="lg" 
          bg="white" 
          _dark={{ bg: "gray.800" }}
          shadow="sm"
          _hover={{ shadow: "md", transform: "translateY(-2px)" }}
          transition="all 0.2s"
          cursor="pointer"
          onClick={() => openImport("product")}
        >
          <Stack align="center" spacing={3}>
            <Box p={3} borderRadius="full" bg="teal.50" color="teal.500" _dark={{ bg: "teal.900", color: "teal.200" }}>
              <FiPackage size={24} />
            </Box>
            <Heading size="md">{t("tasks.import.product")}</Heading>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              {t("tasks.import.upload_help_product")}
            </Text>
            <Button colorScheme="teal" variant="ghost" size="sm">
              {t("tasks.import.submit")}
            </Button>
          </Stack>
        </Box>
      </SimpleGrid>

      {importConfig && (
        <GenericImportModal
          organization={organization}
          isOpen={isOpen}
          onClose={onClose}
          {...importConfig}
        />
      )}
    </Box>
  );
}
