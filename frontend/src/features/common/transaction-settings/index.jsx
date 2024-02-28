import {
    Box
} from "@chakra-ui/react";
import MainLayout from "../main-layout";
import TransactionPrefix from "./TransactionsPrefix";

export default function TransactionSettingsPage() {
  return (
    <MainLayout>
      <Box p={5}>
        <Box p={5} boxShadow={"md"} w={"100%"} maxW={"md"}>
          <TransactionPrefix />
        </Box>
      </Box>
    </MainLayout>
  );
}
