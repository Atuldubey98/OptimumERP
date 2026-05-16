import { Flex, VStack, Heading, HStack, Button } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { MdArrowBack, MdEdit } from "react-icons/md";

export default function ViewHeader({ orgId, recurringInvoiceId }) {
  const navigate = useNavigate();

  return (
    <Flex justify="space-between" align="center">
      <VStack align="start" spacing={1}>
        <Heading size="lg">Recurring Invoice Summary</Heading>
      </VStack>
      <HStack spacing={3}>
        <Button
          leftIcon={<MdArrowBack />}
          variant="ghost"
          onClick={() => navigate(`/${orgId}/recurringInvoices`)}
        >
          Back
        </Button>
        <Button
          leftIcon={<MdEdit />}
          colorScheme="blue"
          onClick={() => navigate(`/${orgId}/recurringInvoices/${recurringInvoiceId}/edit`)}
        >
          Edit
        </Button>
      </HStack>
    </Flex>
  );
}
