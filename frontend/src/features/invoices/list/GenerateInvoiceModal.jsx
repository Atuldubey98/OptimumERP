import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Textarea,
  Button,
  Spinner,
  Icon,
  Box,
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";

const STEP_KEYS = ["party", "products", "invoice"];

const STEP_LABELS = {
  party: "Identifying party",
  products: "Identifying products",
  invoice: "Creating invoice",
};

const STATUS = {
  idle: "idle",
  pending: "pending",
  success: "success",
  error: "error",
};

function StepItem({ label, status }) {
  return (
    <HStack spacing={3}>
      {status === STATUS.pending ? (
        <Spinner size="sm" color="blue.500" />
      ) : status === STATUS.success ? (
        <Icon as={CheckCircleIcon} color="green.500" boxSize={5} />
      ) : status === STATUS.error ? (
        <Icon as={WarningIcon} color="red.500" boxSize={5} />
      ) : (
        <Box w={5} h={5} borderRadius="full" borderWidth={2} borderColor="gray.300" />
      )}
      <Text fontSize="sm" color={status === STATUS.idle ? "gray.400" : "inherit"}>
        {label}
      </Text>
    </HStack>
  );
}

export default function GenerateInvoiceModal({ isOpen, onClose }) {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const [docText, setDocText] = useState("");
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState({
    party: STATUS.idle,
    products: STATUS.idle,
    invoice: STATUS.idle,
  });
  const wsRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      wsRef.current?.close();
      wsRef.current = null;
      setRunning(false);
      setSteps({ party: STATUS.idle, products: STATUS.idle, invoice: STATUS.idle });
      setDocText("");
    }
  }, [isOpen]);

  const setStep = (key, status) =>
    setSteps((prev) => ({ ...prev, [key]: status }));

  const handleGenerate = () => {
    if (!docText.trim()) return;

    setRunning(true);
    setSteps({
      party: STATUS.pending,
      products: STATUS.pending,
      invoice: STATUS.pending,
    });

    const apiUrl = import.meta.env.VITE_API_URL || "";
    const wsUrl = apiUrl.replace(/^http/, "ws") + "/ws";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "extract_invoice", orgId, docText }));
    };

    ws.onmessage = (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (msg.type) {
        case "party_identified":
          setStep("party", STATUS.success);
          break;
        case "party_not_found":
          setStep("party", STATUS.error);
          break;
        case "products_identified":
          setStep("products", STATUS.success);
          break;
        case "products_not_found":
          setStep("products", STATUS.error);
          break;
        case "invoice_created":
          setStep("invoice", STATUS.success);
          setRunning(false);
          ws.close();
          setTimeout(() => {
            onClose();
            navigate(`/${orgId}/invoices/${msg.invoiceId}/edit`);
          }, 800);
          break;
        case "invoice_creation_failed":
        case "invoice_not_created":
          setStep("invoice", STATUS.error);
          setRunning(false);
          ws.close();
          break;
        case "error":
          setStep("party", STATUS.error);
          setStep("products", STATUS.error);
          setStep("invoice", STATUS.error);
          setRunning(false);
          ws.close();
          break;
      }
    };

    ws.onerror = () => {
      setSteps({ party: STATUS.error, products: STATUS.error, invoice: STATUS.error });
      setRunning(false);
    };

    ws.onclose = () => {
      setRunning(false);
    };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Generate Invoice with AI</ModalHeader>
        <ModalCloseButton isDisabled={running} />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Textarea
              placeholder="Paste invoice / purchase order text here..."
              rows={8}
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              isDisabled={running}
              resize="vertical"
            />
            <Button
              colorScheme="purple"
              onClick={handleGenerate}
              isLoading={running}
              isDisabled={!docText.trim() || running}
            >
              Generate
            </Button>
            {STEP_KEYS.some((k) => steps[k] !== STATUS.idle) && (
              <VStack align="stretch" spacing={3} pt={2}>
                {STEP_KEYS.map((key) => (
                  <StepItem key={key} label={STEP_LABELS[key]} status={steps[key]} />
                ))}
              </VStack>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
