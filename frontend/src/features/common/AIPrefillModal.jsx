import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  VStack,
  useToast,
  Input,
  Box,
  Text,
  Icon,
  HStack,
  Image,
  Flex,
  IconButton,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import { useState, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import useProperty from "../../hooks/useProperty";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import { useFileUpload } from "../../hooks/useFileUpload";
import { BsStars, BsCloudUpload, BsFileEarmarkPdf } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";
import instance from "../../instance";

export default function AIPrefillModal({ isOpen, onClose, onPrefill, type = "invoices" }) {
  const { t } = useTranslation("common");
  const { orgId } = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const fileInputRef = useRef(null);

  const { setting } = useCurrentOrgCurrency();
  const { value: AI_MODELS } = useProperty("AI_MODELS");
  const { attachment, handleFileChange, clearAttachment } = useFileUpload();

  // Color Mode Values
  const modalBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("blue.50", "blue.900");
  const headerText = useColorModeValue("blue.700", "blue.100");
  const uploadBorder = useColorModeValue("gray.200", "gray.600");
  const uploadBg = useColorModeValue("gray.50", "gray.700");
  const uploadHoverBg = useColorModeValue("blue.50", "gray.600");
  const footerBg = useColorModeValue("gray.50", "gray.900");

  const activeProvider = useMemo(() => {
    return setting?.aiProviders?.find((p) => p.isActive);
  }, [setting]);

  const availableModels = useMemo(() => {
    if (!AI_MODELS || !activeProvider) return [];
    return (AI_MODELS[activeProvider.provider] || []).filter(m => m.vision);
  }, [activeProvider, AI_MODELS]);

  useEffect(() => {
    if (availableModels.length > 0 && !selectedModel) {
      setSelectedModel(availableModels[0].id);
    }
  }, [availableModels, selectedModel]);

  const handleProcess = async () => {
    if (!selectedModel) {
      toast({
        title: "Model Required",
        description: "Please select a vision-capable AI model.",
        status: "warning",
      });
      return;
    }

    if (!attachment) {
      toast({
        title: "File Required",
        description: "Please upload an invoice or purchase document.",
        status: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      const { data } = await instance.post(
        `/api/v1/organizations/${orgId}/${type}/ai-prefill`,
        {
          model: selectedModel,
          attachment: {
            name: attachment.name,
            type: attachment.type,
            content: attachment.content,
          },
          type
        }
      );

      onPrefill(data.data);
      toast({
        title: "Extraction Complete",
        description: "The form has been pre-filled with the extracted data.",
        status: "success",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Extraction Error",
        description: error.response?.data?.message || "AI failed to parse the document. Please try a different model or clear image.",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
      <ModalContent 
        borderRadius="2xl" 
        overflow="hidden" 
        bg={modalBg}
        boxShadow="2xl"
      >
        <ModalHeader 
          bg={headerBg} 
          p={6}
        >
          <HStack spacing={3}>
            <Flex
              bg="blue.500"
              color="white"
              p={2}
              borderRadius="lg"
              boxShadow="0 0 15px rgba(66, 153, 225, 0.6)"
            >
              <Icon as={BsStars} w={5} h={5} />
            </Flex>
            <VStack align="start" spacing={0}>
              <Text fontSize="xl" fontWeight="bold" color={headerText}>
                Smart Auto-fill
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton mt={4} />
        
        <ModalBody py={8} px={8}>
          <VStack spacing={8} align="stretch">
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="bold" mb={2} textTransform="uppercase" letterSpacing="wider">
                1. Choose Vision Model
              </FormLabel>
              <Select
                size="lg"
                variant="filled"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                placeholder={availableModels.length === 0 ? "No vision models found" : undefined}
                isDisabled={availableModels.length === 0 || loading}
                fontWeight="medium"
              >
                {availableModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="bold" mb={2} textTransform="uppercase" letterSpacing="wider">
                2. Upload Invoice/Document
              </FormLabel>
              <Box
                border="2px dashed"
                borderColor={attachment ? "blue.400" : uploadBorder}
                borderRadius="2xl"
                p={8}
                bg={attachment ? uploadHoverBg : uploadBg}
                textAlign="center"
                cursor={loading ? "not-allowed" : "pointer"}
                onClick={() => !loading && fileInputRef.current?.click()}
                _hover={!loading ? { borderColor: "blue.400", bg: uploadHoverBg } : {}}
                transition="all 0.3s cubic-bezier(.08,.52,.52,1)"
                position="relative"
                opacity={loading ? 0.6 : 1}
              >
                <Input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  isDisabled={loading}
                />
                
                {attachment ? (
                  <VStack spacing={4}>
                    <Box position="relative">
                      {attachment.type.startsWith("image/") ? (
                        <Image
                          src={attachment.preview}
                          maxH="200px"
                          borderRadius="xl"
                          objectFit="contain"
                          boxShadow="lg"
                        />
                      ) : (
                        <Flex 
                          direction="column" 
                          align="center" 
                          p={6} 
                          bg="whiteAlpha.200" 
                          borderRadius="xl"
                        >
                          <Icon as={BsFileEarmarkPdf} w={16} h={16} color="red.400" />
                        </Flex>
                      )}
                      <IconButton
                        position="absolute"
                        top="-10px"
                        right="-10px"
                        size="sm"
                        isRound
                        icon={<AiOutlineClose />}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!loading) clearAttachment();
                        }}
                        aria-label="Remove file"
                        colorScheme="red"
                        boxShadow="md"
                        isDisabled={loading}
                      />
                    </Box>
                    <VStack spacing={0}>
                      <Text fontWeight="bold" fontSize="md" color={useColorModeValue("gray.700", "white")}>
                        {attachment.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Ready for processing
                      </Text>
                    </VStack>
                  </VStack>
                ) : (
                  <VStack spacing={4}>
                    <Flex
                      w={16}
                      h={16}
                      bg="blue.500"
                      color="white"
                      borderRadius="full"
                      align="center"
                      justify="center"
                      boxShadow="0 8px 20px rgba(66, 153, 225, 0.3)"
                    >
                      <Icon as={BsCloudUpload} w={8} h={8} />
                    </Flex>
                    <VStack spacing={1}>
                      <Text fontWeight="bold" fontSize="lg">
                        Drop your document here
                      </Text>
                      <Text color="gray.500" fontSize="sm">
                        or click to browse your files
                      </Text>
                    </VStack>
                  </VStack>
                )}
              </Box>
            </FormControl>
          </VStack>
        </ModalBody>

        <Divider />

        <ModalFooter gap={4} p={6} bg={footerBg}>
          <Button 
            variant="ghost" 
            onClick={onClose} 
            size="lg"
            fontWeight="bold"
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            size="md"
            leftIcon={<BsStars />}
            isLoading={loading}
            loadingText="Analyzing..."
            onClick={handleProcess}
            isDisabled={!attachment || !selectedModel}
          >
            Start Extraction
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
