import { Heading, Link, SimpleGrid, Stack, Text, Flex, Spinner } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PricingCard from "./PricingCard";
import instance from "../../instance";

export default function PricingPage() {
  const { t } = useTranslation("party");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await instance.get("/api/v1/users/plans");
        setPlans(data.data.plans);
      } catch (error) {
        console.error("Failed to fetch plans", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
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
            plan={plan.key}
            key={index}
            price={
              <>
                ₹{plan.price}{" "}
                <Text fontSize={"sm"} as="span">
                  / Year
                </Text>
              </>
            }
            planOfferings={plan.featureList}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
