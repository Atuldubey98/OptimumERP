import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Spinner,
  Tag,
  useDisclosure,
} from "@chakra-ui/react";
import MainLayout from "../common/main-layout";
import { useNavigate } from "react-router-dom";
import TableLayout from "../common/table-layout";
import useEsitamtes from "../../hooks/useEsimates";
import VertIconMenu from "../common/table-layout/VertIconMenu";
import QuoteModal from "./list/QuoteModal";
import { useState } from "react";
import SearchItem from "../common/table-layout/SearchItem";
import { statusList } from "./create/data";

export default function EstimatesPage() {
  const navigate = useNavigate();
  const onClickAddNewQuote = () => {
    navigate(`create`);
  };
  const { estimates, onChangeDateFilter, dateFilter, status } = useEsitamtes();
  const loading = status === "loading";
  const estimateTableMapper = (estimate) => ({
    customerName: estimate.customer.name,
    billingAddress: estimate.customer.billingAddress,
    ...estimate,
    date: new Date(estimate.date).toISOString().split("T")[0],
    grandTotal: estimate.total + estimate.totalTax,
    status: (
      <Tag
        textTransform={"capitalize"}
        size={"md"}
        variant={"solid"}
        colorScheme={
          statusList.find((statusItem) => statusItem.type === estimate.status)
            .colorScheme || "blue"
        }
      >
        {estimate.status}
      </Tag>
    ),
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [quotation, setQuotation] = useState(null);
  const onOpenQuotation = (estimate) => {
    setQuotation(estimate);
    onOpen();
  };
  return (
    <MainLayout>
      {loading ? (
        <Flex justifyContent={"center"} alignItems={"center"}>
          <Spinner size={"md"} />
        </Flex>
      ) : (
        <TableLayout
          filter={
            <Grid gap={2}>
              <Divider />
              <Box>
                <SearchItem placeholder="Search by description" />
              </Box>
              <Grid gap={5} gridTemplateColumns={"1fr 1fr"}>
                <FormControl>
                  <FormLabel fontWeight={"bold"}>Start Date</FormLabel>
                  <Input
                    name="startDate"
                    value={dateFilter.startDate}
                    onChange={onChangeDateFilter}
                    placeholder="Start date"
                    type="date"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight={"bold"}>End Date</FormLabel>
                  <Input
                    value={dateFilter.endDate}
                    placeholder="End date"
                    type="date"
                    name="endDate"
                    onChange={onChangeDateFilter}
                  />
                </FormControl>
              </Grid>
              <Divider />
            </Grid>
          }
          heading={"Quotations"}
          tableData={estimates.map(estimateTableMapper)}
          caption={`Total estimates found : ${estimates.length}`}
          operations={estimates.map((estimate) => (
            <VertIconMenu
              showItem={() => onOpenQuotation(estimate)}
              editItem={() => {
                navigate(`${estimate._id}/edit`);
              }}
              deleteItem={() => {}}
            />
          ))}
          selectedKeys={{
            date: "Quotation Date",
            status: "Status",
            customerName: "Customer name",
            quoteNo: "Quote No.",
            billingAddress: "Billing address",
            grandTotal: "Total",
          }}
          onAddNewItem={onClickAddNewQuote}
        />
      )}
      {quotation ? (
        <QuoteModal isOpen={isOpen} onClose={onClose} quotation={quotation} />
      ) : null}
    </MainLayout>
  );
}
