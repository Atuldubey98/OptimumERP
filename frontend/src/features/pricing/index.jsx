import { Heading, Link, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import React from "react";
import MainLayout from "../common/main-layout";
import PricingCard from "./PricingCard";
export default function PricingPage() {
  const plans = [
    {
      value: "free",
      price: (
        <>
          Free <Text fontSize={"sm"}>lifetime</Text>
        </>
      ),
    },
    {
      value: "gold",
      price: (
        <>
          Rs. 999 <Text fontSize={"sm"}>per Year</Text>
        </>
      ),
    },
    {
      value: "platinum",
      price: (
        <>
          Rs. 1999 <Text fontSize={"sm"}>per Year</Text>
        </>
      ),
    },
  ];
  const allPlans = plans.map((plan) => plan.value);
  const planOfferings = [
    {
      value: "Manage your customers, vendors and contacts at one place",
      valid: allPlans,
    },
    {
      value: "Advanced reporting features.",
      valid: allPlans,
    },
    {
      value: "Advance invoicing and expense tracking",
      valid: allPlans,
    },

    {
      value: "Product management capabilities",
      valid: allPlans,
    },

    {
      value: "Dashboard and financial projections",
      valid: allPlans,
    },
    {
      value: "Proforma Invoicing enabled",
      valid: ["free", "gold", "platinum"],
    },
    {
      value: "Mail receipts from dashboard",
      valid: ["gold", "platinum"],
    },
    {
      value: "QR Code enabled on invoices",
      valid: ["gold", "platinum"],
    },
    {
      value: "On-Premise deployment of application",
      valid: ["platinum"],
    },
  ];

  return (
    <MainLayout>
      <Stack spacing={5} p={4}>
        <Heading fontSize={"xl"}>Plans</Heading>
        <Text>
          Our pricing structure is build to be affordable for everyone from
          indivisuals to organizations
        </Text>
        <Text>
          To upgrade to any of the below given plans you can contact at{" "}
          <Link href="mailto:optimumerp2024@gmail.com">
            optimumerp2024@gmail.com
          </Link>
        </Text>
        <SimpleGrid gap={8} minChildWidth={350}>
          {plans.map((plan, index) => (
            <PricingCard
              plan={plan.value}
              key={index}
              price={plan.price}
              planOfferings={planOfferings}
            />
          ))}
        </SimpleGrid>
      </Stack>
    </MainLayout>
  );
}
