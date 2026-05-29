import { Heading, Link, SimpleGrid, Text, Flex, Spinner, Box, VStack, useColorModeValue } from "@chakra-ui/react";
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
    <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 8, md: 12 }}>
      <VStack spacing={4} textAlign="center" mb={12}>
        <Heading
          as="h1"
          fontSize={{ base: "3xl", md: "4xl" }}
          fontWeight="extrabold"
          color={useColorModeValue("blue.600", "blue.400")}
          lineHeight="1.2"
        >
          {t("pricing_ui.page.heading")}
        </Heading>
        <Text
          fontSize={{ base: "md", md: "lg" }}
          color={useColorModeValue("gray.600", "gray.400")}
          maxW="2xl"
          mx="auto"
        >
          {t("pricing_ui.page.subtitle")}
        </Text>
        <Box
          p={3}
          px={6}
          borderRadius="full"
          bg={useColorModeValue("blue.50", "whiteAlpha.50")}
          borderWidth="1px"
          borderColor={useColorModeValue("blue.100", "whiteAlpha.100")}
          fontSize="sm"
          color={useColorModeValue("blue.600", "blue.300")}
          fontWeight="medium"
          display="inline-flex"
          alignItems="center"
          gap={2}
        >
          {t("pricing_ui.page.contact_text")}{" "}
          <Link
            href="mailto:optimumerp2024@gmail.com"
            fontWeight="bold"
            color={useColorModeValue("blue.700", "blue.200")}
            _hover={{ textDecoration: "underline" }}
          >
            optimumerp2024@gmail.com
          </Link>
        </Box>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8} justifyItems="center" alignItems="stretch">
        {plans.map((plan, index) => (
          <PricingCard
            plan={plan.key}
            key={index}
            price={plan.price}
            planOfferings={plan.featureList}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
}
