import { Box, Flex, Stack, StatGroup } from "@chakra-ui/react";
import React from "react";
import MainLayout from "../common/main-layout";
import Dashcard from "./Dashcard";
import Dashtable from "./Dashtable";
export default function DashboardPage() {
  return (
    <MainLayout>
      <Stack spacing={3}>
        <StatGroup>
          <Dashcard dashType="invoice" dashTotal={"450"} />
          <Dashcard dashType="quote" dashTotal={"450"} />
          <Dashcard dashType="expense" dashTotal={"450"} />
          <Dashcard dashType="customer" dashTotal={"450"} />
        </StatGroup>
        <Flex
          flexWrap={"wrap"}
          gap={4}
          justifyContent={"center"}
          alignContent={"center"}
        >
          <Dashtable
            heading={"Recent Invoices"}
            headingRow={["Number", "Client", "Total", "Status", ""]}
            columns={[
              {
                num: 4,
                client: "Dharampal Satyapal ltd",
                total: 2356,
                status: "Paid",
              },
              {
                num: 1,
                client: "Motherson",
                total: 2356,
                status: "Paid",
              },
              {
                num: 2,
                client: "DS Ltd Sparsh",
                total: 2356,
                status: "Paid",
              },
              {
                num: 3,
                client: "SMIEL",
                total: 2356,
                status: "Paid",
              },
            ]}
          />
          <Dashtable
            heading={"Recent Quotes"}
            headingRow={["Number", "Client", "Total", "Status", ""]}
            columns={[
              {
                num: 4,
                client: "Dharampal Satyapal ltd",
                total: 2356,
                status: "Paid",
              },
              {
                num: 1,
                client: "Motherson",
                total: 2356,
                status: "Paid",
              },
              {
                num: 2,
                client: "DS Ltd Sparsh",
                total: 2356,
                status: "Paid",
              },
              {
                num: 3,
                client: "SMIEL",
                total: 2356,
                status: "Paid",
              },
            ]}
          />
        </Flex>
      </Stack>
    </MainLayout>
  );
}
