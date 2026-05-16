import {
  Box,
  Flex,
  Grid,
  Spinner,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import instance from "../../../instance";
import ViewHeader from "./components/ViewHeader";
import StatCards from "./components/StatCards";
import ReceiptContent from "./components/ReceiptContent";
import HistorySidebar from "./components/HistorySidebar";

export default function RecurringInvoiceViewPage() {
  const { orgId, recurringInvoiceId } = useParams();
  const [ri, setRi] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const bgColor = useColorModeValue("gray.50", "gray.900");

  useEffect(() => {
    const fetchRi = async () => {
      try {
        setLoading(true);
        const { data } = await instance.get(
          `/api/v1/organizations/${orgId}/recurringInvoices/${recurringInvoiceId}`
        );
        setRi(data.data);
      } catch (error) {
        toast({
          title: "Error fetching recurring invoice",
          status: "error",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchRi();
  }, [orgId, recurringInvoiceId, toast]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
      </Flex>
    );
  }

  if (!ri) return null;

  return (
    <Box p={6} bg={bgColor} minH="100vh">
      <Flex direction="column" gap={6} maxW="1200px" mx="auto">
        <ViewHeader orgId={orgId} recurringInvoiceId={recurringInvoiceId} />

        <StatCards ri={ri} />

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
          <ReceiptContent ri={ri} />
          <HistorySidebar ri={ri} orgId={orgId} />
        </Grid>
      </Flex>
    </Box>
  );
}
