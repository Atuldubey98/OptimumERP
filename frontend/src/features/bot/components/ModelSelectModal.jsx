import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  VStack,
  HStack,
  Text,
  Badge,
  InputGroup,
  InputLeftElement,
  Box,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { Select as ChakraReactSelect } from "chakra-react-select";
import { FiSearch, FiCheck, FiZap, FiAlertTriangle } from "react-icons/fi";
import { useState, useMemo } from "react";

const PROVIDER_COLORS = {
  ollama: { scheme: "green", dot: "#38A169" },
  grok: { scheme: "purple", dot: "#805AD5" },
};

const ProviderDot = ({ provider }) => {
  const color = PROVIDER_COLORS[provider]?.dot || "#718096";
  return (
    <Box
      as="span"
      display="inline-block"
      w="8px"
      h="8px"
      borderRadius="full"
      bg={color}
      mr={2}
      flexShrink={0}
    />
  );
};

const ModelSelectModal = ({
  isOpen,
  onClose,
  availableModels,
  selectedModel,
  onSelect,
  activeProviders = [],
  selectedProviderId,
  onSelectProvider,
}) => {
  const [search, setSearch] = useState("");
  const [onlyVision, setOnlyVision] = useState(false);
  const [onlyThinking, setOnlyThinking] = useState(false);

  const filteredModels = useMemo(() => {
    return availableModels.filter(
      (m) => {
        const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.id.toLowerCase().includes(search.toLowerCase());
        const matchesVision = !onlyVision || m.vision === true;
        const matchesThinking = !onlyThinking || m.thinking === true;
        return matchesSearch && matchesVision && matchesThinking;
      }
    );
  }, [availableModels, search, onlyVision, onlyThinking]);

  const bg = useColorModeValue("white", "gray.800");
  const color = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.300");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const activeBg = useColorModeValue("blue.50", "blue.900");
  const activeBorder = useColorModeValue("blue.500", "blue.400");
  const subText = useColorModeValue("gray.500", "gray.400");

  // Build options for chakra-react-select
  const providerOptions = activeProviders.map((p) => ({
    value: p._id,
    label: p.name,
    provider: p.provider,
  }));

  const selectedOption = providerOptions.find((o) => o.value === selectedProviderId) || null;

  const formatOptionLabel = (option) => (
    <HStack spacing={0} align="center">
      <ProviderDot provider={option.provider} />
      <Text fontSize="sm" fontWeight="500">{option.label}</Text>
      <Badge
        ml={2}
        colorScheme={PROVIDER_COLORS[option.provider]?.scheme || "gray"}
        fontSize="0.6rem"
        textTransform="capitalize"
      >
        {option.provider}
      </Badge>
    </HStack>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent bg={bg} color={color}>
        <ModalHeader fontSize="md" pb={2}>
          <HStack spacing={2}>
            <FiZap size={16} />
            <Text>AI Settings</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          {/* Provider selector */}
          <Text fontSize="xs" fontWeight="700" color={subText} textTransform="uppercase" letterSpacing="wider" mb={2}>
            Active Provider
          </Text>

          {activeProviders.length === 0 ? (
            <HStack
              p={3}
              borderWidth="1px"
              borderRadius="md"
              borderColor="orange.400"
              bg={useColorModeValue("orange.50", "orange.900")}
              spacing={2}
              mb={4}
            >
              <FiAlertTriangle color="orange" />
              <Text fontSize="sm" color="orange.500" fontWeight="500">
                No active AI providers. Please configure one in Settings.
              </Text>
            </HStack>
          ) : (
            <Box mb={4}>
              <ChakraReactSelect
                options={providerOptions}
                value={selectedOption}
                onChange={(opt) => opt && onSelectProvider(opt.value, onClose)}
                formatOptionLabel={formatOptionLabel}
                formatGroupLabel={formatOptionLabel}
                isSearchable={false}
                chakraStyles={{
                  container: (base) => ({ ...base, fontSize: "sm" }),
                  control: (base) => ({
                    ...base,
                    borderRadius: "lg",
                    bg: bg,
                    borderColor: selectedOption
                      ? PROVIDER_COLORS[selectedOption.provider]?.dot || borderColor
                      : borderColor,
                    boxShadow: "sm",
                    _hover: { borderColor: PROVIDER_COLORS[selectedOption?.provider]?.dot || borderColor },
                  }),
                  menu: (base) => ({
                    ...base,
                    bg: bg,
                    borderColor: borderColor,
                  }),
                  option: (base, state) => ({
                    ...base,
                    bg: state.isFocused ? hoverBg : (state.isSelected ? useColorModeValue("gray.100", "whiteAlpha.200") : bg),
                    color: color,
                  }),
                }}
              />
            </Box>
          )}

          <Divider mb={4} />

          {/* Model selector */}
          <Text fontSize="xs" fontWeight="700" color={subText} textTransform="uppercase" letterSpacing="wider" mb={2}>
            Model
          </Text>

          <InputGroup mb={3}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              borderColor={borderColor}
              fontSize="sm"
            />
          </InputGroup>

          <HStack spacing={2} mb={3} wrap="wrap">
            <Badge
              px={2.5}
              py={1}
              borderRadius="full"
              cursor="pointer"
              variant={onlyVision ? "solid" : "outline"}
              colorScheme="purple"
              onClick={() => setOnlyVision(!onlyVision)}
              display="flex"
              alignItems="center"
              fontSize="0.75rem"
              fontWeight="600"
              textTransform="none"
              userSelect="none"
              transition="all 0.15s ease"
              _hover={{ transform: "translateY(-1px)", boxShadow: "sm" }}
              _active={{ transform: "translateY(0)" }}
            >
              👁️ Vision
            </Badge>
            <Badge
              px={2.5}
              py={1}
              borderRadius="full"
              cursor="pointer"
              variant={onlyThinking ? "solid" : "outline"}
              colorScheme="green"
              onClick={() => setOnlyThinking(!onlyThinking)}
              display="flex"
              alignItems="center"
              fontSize="0.75rem"
              fontWeight="600"
              textTransform="none"
              userSelect="none"
              transition="all 0.15s ease"
              _hover={{ transform: "translateY(-1px)", boxShadow: "sm" }}
              _active={{ transform: "translateY(0)" }}
            >
              🧠 Thinking
            </Badge>
          </HStack>

          <VStack
            align="stretch"
            spacing={2}
            maxH="280px"
            overflowY="auto"
            css={{
              "&::-webkit-scrollbar": { width: "4px" },
              "&::-webkit-scrollbar-thumb": { background: "gray", borderRadius: "24px" },
            }}
          >
            {filteredModels.length === 0 && availableModels.length === 0 && (
              <Text textAlign="center" color={subText} py={4} fontSize="sm">
                Select a provider above to see available models.
              </Text>
            )}
            {filteredModels.length === 0 && availableModels.length > 0 && (
              <Text textAlign="center" color={subText} py={4} fontSize="sm">
                No models found matching the selected criteria.
              </Text>
            )}
            {filteredModels.map((m) => (
              <Box
                key={m.id}
                p={3}
                borderWidth="1px"
                borderRadius="md"
                borderColor={selectedModel === m.id ? activeBorder : borderColor}
                bg={selectedModel === m.id ? activeBg : "transparent"}
                cursor="pointer"
                onClick={() => {
                  onSelect(m.id);
                  onClose();
                }}
                _hover={{ bg: selectedModel === m.id ? activeBg : hoverBg }}
                transition="all 0.2s"
              >
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="600" fontSize="sm">{m.name}</Text>
                    <Text fontSize="xs" color={subText}>{m.id}</Text>
                    {(m.vision || m.thinking) && (
                      <HStack mt={1}>
                        {m.vision && <Badge colorScheme="purple" fontSize="0.6rem">Vision</Badge>}
                        {m.thinking && <Badge colorScheme="green" fontSize="0.6rem">Thinking</Badge>}
                      </HStack>
                    )}
                  </VStack>
                  {selectedModel === m.id && <FiCheck color="#3182CE" size={18} />}
                </HStack>
              </Box>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModelSelectModal;
