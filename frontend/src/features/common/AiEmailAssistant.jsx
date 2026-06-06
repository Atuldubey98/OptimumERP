import {
  Box,
  Button,
  Collapse,
  Flex,
  HStack,
  Text,
  Textarea,
  VStack,
  useToast
} from "@chakra-ui/react";
import { useState } from "react";
import { HiOutlineSparkles } from "react-icons/hi2";
import useGenerate from "../../hooks/useGenerate";

export default function AiEmailAssistant({ bill, billType, isBotEnabled, recipientNames, onApplyDraft, showAiAssist, setShowAiAssist }) {
  const [customPrompt, setCustomPrompt] = useState("");
  const { generate, status: aiStatus, error: aiError, result: aiResult, setResult: setAiResult } = useGenerate();
  const toast = useToast();

  const getBillGrandTotal = () =>
    Number(bill?.total || 0) +
    Number(bill?.totalTax || 0) +
    Number(bill?.shippingCharges || 0);

  const getBusinessContext = () => {
    const totalAmount = getBillGrandTotal();
    return `Doc:${billType},No:${bill?.num || ''},Client:${bill?.party?.name || ''},Amt:${totalAmount},To:${recipientNames || ''}`;
  };

  const handleGenerate = async (promptText) => {
    try {
      const context = getBusinessContext();
      await generate(promptText, context);
    } catch (err) {
      // Handled by useGenerate hook
    }
  };

  const handleApplyDraft = () => {
    if (aiResult) {
      const formattedHtml = aiResult
        .split('\n')
        .map(paragraph => paragraph.trim() ? `<p>${paragraph}</p>` : '<p><br></p>')
        .join('');
      onApplyDraft(formattedHtml);
      toast({
        title: "Success",
        description: "AI draft applied.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      setShowAiAssist(false);
      setAiResult(null);
      setCustomPrompt("");
    }
  };

  const presets = [
    { label: "Standard Delivery", prompt: `Draft delivery email for this ${billType}.` },
    { label: "Payment Reminder", prompt: `Draft payment reminder for this ${billType}.` },
    { label: "Thank You Note", prompt: "Draft thank you email for recent business." }
  ];

  return (
    <Box mb={2}>
      <Collapse in={showAiAssist} animateOpacity>
        <Box
          p={4}
          mb={4}
          borderWidth="1px"
          borderRadius="lg"
          bg="purple.50"
          borderColor="purple.200"
          _dark={{
            bg: "purple.900",
            borderColor: "purple.800"
          }}
        >
          <VStack align="stretch" spacing={3}>
            <Flex align="center" gap={2}>
              <HiOutlineSparkles color="#805AD5" />
              <Text fontWeight="semibold" fontSize="xs" color="purple.700" _dark={{ color: "purple.300" }}>
                AI Email Assistant
              </Text>
            </Flex>

            <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
              Quick presets or write custom instruction to draft. Context is added automatically.
            </Text>

            {/* Presets */}
            <HStack spacing={2} wrap="wrap" rowGap={2}>
              {presets.map((preset, index) => (
                <Button
                  key={index}
                  size="xs"
                  variant="outline"
                  colorScheme="purple"
                  onClick={() => {
                    setCustomPrompt(preset.prompt);
                    handleGenerate(preset.prompt);
                  }}
                  isDisabled={aiStatus === "loading"}
                >
                  {preset.label}
                </Button>
              ))}
            </HStack>

            {/* Custom Prompt Input */}
            <VStack align="stretch" spacing={1.5}>
              <Textarea
                placeholder="e.g. Write a friendly reminder asking to pay by next Friday."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                size="sm"
                bg="white"
                _dark={{ bg: "gray.800" }}
                borderRadius="md"
                fontSize="xs"
                minH="60px"
              />
              <Flex justify="space-between" align="center" gap={2}>
                {aiError && (
                  <Text fontSize="xs" color="red.500" noOfLines={1} maxW="70%">
                    {aiError}
                  </Text>
                )}
                {!aiError && <Box />}
                <Button
                  size="xs"
                  colorScheme="purple"
                  onClick={() => handleGenerate(customPrompt)}
                  isLoading={aiStatus === "loading"}
                  isDisabled={!customPrompt.trim()}
                >
                  Generate Draft
                </Button>
              </Flex>
            </VStack>

            {/* Result Preview */}
            {aiResult && (
              <Box
                p={3}
                bg="white"
                borderWidth="1px"
                borderColor="purple.100"
                _dark={{
                  bg: "gray.900",
                  borderColor: "purple.800",
                }}
                borderRadius="md"
                fontSize="xs"
              >
                <Text fontWeight="semibold" mb={1} color="purple.700" _dark={{ color: "purple.300" }}>
                  Draft Preview:
                </Text>
                <Box
                  maxH="150px"
                  overflowY="auto"
                  whiteSpace="pre-wrap"
                  p={2}
                  bg="gray.50"
                  _dark={{ bg: "gray.800" }}
                  borderRadius="sm"
                  mb={2}
                >
                  {aiResult}
                </Box>
                <Flex justify="flex-end" gap={2}>
                  <Button
                    size="xs"
                    variant="outline"
                    colorScheme="gray"
                    onClick={() => setAiResult(null)}
                  >
                    Discard
                  </Button>
                  <Button
                    size="xs"
                    colorScheme="purple"
                    onClick={handleApplyDraft}
                  >
                    Insert in Email
                  </Button>
                </Flex>
              </Box>
            )}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
}
