import { Heading, Link, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";
import MainLayout from "../common/main-layout";
import PricingCard from "./PricingCard";
export default function PricingPage() {
  const { t } = useTranslation("party");
  const plans = [
    {
      value: "free",
      price: (
        <>
          {t("pricing_ui.plans.free.price")} <Text fontSize={"sm"}>{t("pricing_ui.plans.free.period")}</Text>
        </>
      ),
    },
    {
      value: "gold",
      price: (
        <>
          {t("pricing_ui.plans.gold.price")} <Text fontSize={"sm"}>{t("pricing_ui.plans.gold.period")}</Text>
        </>
      ),
    },
    {
      value: "platinum",
      price: (
        <>
          {t("pricing_ui.plans.platinum.price")} <Text fontSize={"sm"}>{t("pricing_ui.plans.platinum.period")}</Text>
        </>
      ),
    },
  ];
  const allPlans = plans.map((plan) => plan.value);
  const planOfferings = [
    {
      value: t("pricing_ui.offerings.manage_contacts"),
      valid: allPlans,
    },
    {
      value: t("pricing_ui.offerings.advanced_reporting"),
      valid: allPlans,
    },
    {
      value: t("pricing_ui.offerings.invoicing_expense"),
      valid: allPlans,
    },
    {
      value: t("pricing_ui.offerings.product_management"),
      valid: allPlans,
    },
    {
      value: t("pricing_ui.offerings.dashboard_projections"),
      valid: allPlans,
    },
    {
      value: t("pricing_ui.offerings.proforma_invoicing"),
      valid: ["free", "gold", "platinum"],
    },
    {
      value: t("pricing_ui.offerings.mail_receipts"),
      valid: ["gold", "platinum"],
    },
    {
      value: t("pricing_ui.offerings.qr_code"),
      valid: ["gold", "platinum"],
    },
    {
      value: t("pricing_ui.offerings.on_premise"),
      valid: ["platinum"],
    },
  ];

  return (
    <MainLayout>
      <Stack spacing={5} p={4}>
        <Heading fontSize={"xl"}>{t("pricing_ui.page.heading")}</Heading>
        <Text>{t("pricing_ui.page.subtitle")}</Text>
        <Text>
          {t("pricing_ui.page.contact_text")}{" "}
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
