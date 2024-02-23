import { Button, Flex } from "@chakra-ui/react";
import MainLayout from "../common/main-layout";
import { useNavigate } from "react-router-dom";
import TableLayout from "../common/table-layout";
import useEsitamtes from "../../hooks/useEsimates";
import VertIconMenu from "../common/table-layout/VertIconMenu";

export default function EstimatesPage() {
  const navigate = useNavigate();
  const onClickAddNewQuote = () => {
    navigate(`create`);
  };
  const { estimates } = useEsitamtes();
  const estimateTableMapper = (estimate) => ({
    customerName: estimate.customer.name,
    ...estimate,
    date: new Date(estimate.date).toISOString().split("T")[0],
    grandTotal: estimate.total + estimate.totalTax,
  });
  return (
    <MainLayout>
      <TableLayout
        heading={"Quotations"}
        tableData={estimates.map(estimateTableMapper)}
        caption={`Total estimates found : ${estimates.length}`}
        operations={estimates.map((estimate) => (
          <VertIconMenu
            showItem={() => {
              
            }}
            editItem={() => {
              navigate(`${estimate._id}/edit`)
            }}
            deleteItem={() => {
              
            }}
          />
        ))}
        selectedKeys={{
          date: "Quotation Date",
          customerName: "Customer name",
          quoteNo: "Quote No.",
          grandTotal: "Total"
        }}
        onAddNewItem={onClickAddNewQuote}
      />
    </MainLayout>
  );
}
