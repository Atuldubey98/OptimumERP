import { Heading, Link, SimpleGrid, Text, Flex, Spinner, Box, VStack, useColorModeValue, Icon } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiMail } from "react-icons/fi";
import PricingCard from "./PricingCard";
import instance from "../../instance";

export default function PricingPage() {
  const { t } = useTranslation("party");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Premium themes and color values
  const headingColor = useColorModeValue("blue.600", "blue.400");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const badgeBg = useColorModeValue("blue.50", "whiteAlpha.100");
  const badgeBorder = useColorModeValue("blue.100", "whiteAlpha.200");
  const badgeText = useColorModeValue("blue.700", "blue.300");
  const linkColor = useColorModeValue("blue.600", "blue.400");
  const linkHoverColor = useColorModeValue("blue.700", "blue.300");
  const pageBg = useColorModeValue("gray.50/30", "gray.900/10");

  const topGlowOpacity = useColorModeValue(0.12, 0.06);
  const bottomGlowOpacity = useColorModeValue(0.1, 0.05);

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
        <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box 
      position="relative" 
      overflow="hidden" 
      minH="80vh" 
      bg={pageBg}
      py={{ base: 12, md: 20 }}
      px={{ base: 4, md: 8 }}
    >
      {/* Decorative blurred background shapes for premium look */}
      <Box
        position="absolute"
        top="-10%"
        left="-5%"
        width={{ base: "260px", md: "500px" }}
        height={{ base: "260px", md: "500px" }}
        borderRadius="full"
        bg="blue.400"
        filter="blur(120px)"
        opacity={topGlowOpacity}
        pointerEvents="none"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="-10%"
        right="-5%"
        width={{ base: "300px", md: "600px" }}
        height={{ base: "300px", md: "600px" }}
        borderRadius="full"
        bg="purple.400"
        filter="blur(150px)"
        opacity={bottomGlowOpacity}
        pointerEvents="none"
        zIndex={0}
      />

      <VStack spacing={6} textAlign="center" mb={16} position="relative" zIndex={1}>
        <Box
          p={2.5}
          px={6}
          borderRadius={{ base: "2xl", sm: "full" }}
          bg={badgeBg}
          borderWidth="1px"
          borderColor={badgeBorder}
          fontSize="xs"
          color={badgeText}
          fontWeight="semibold"
          display="inline-flex"
          flexDirection={{ base: "column", sm: "row" }}
          alignItems="center"
          textAlign="center"
          gap={2}
          shadow="sm"
          backdropFilter="blur(8px)"
          transition="all 0.3s ease"
          _hover={{ transform: "translateY(-1px)", shadow: "md" }}
        >
          <Flex alignItems="center" gap={2}>
            <Icon as={FiMail} w={3.5} h={3.5} />
            <Text>{t("pricing_ui.page.contact_text")}</Text>
          </Flex>
          <Link
            href="mailto:optimumerp2024@gmail.com"
            fontWeight="bold"
            color={linkColor}
            _hover={{ color: linkHoverColor }}
          >
            optimumerp2024@gmail.com
          </Link>
        </Box>

        <Heading
          as="h1"
          fontSize={{ base: "3xl", md: "5xl" }}
          fontWeight="extrabold"
          color={headingColor}
          lineHeight="1.2"
          letterSpacing="tight"
        >
          {t("pricing_ui.page.heading")}
        </Heading>
        
        <Text
          fontSize={{ base: "md", md: "xl" }}
          color={textColor}
          maxW="2xl"
          mx="auto"
          lineHeight="1.6"
        >
          {t("pricing_ui.page.subtitle")}
        </Text>
      </VStack>

      <Box position="relative" zIndex={1} maxW="1200px" mx="auto">
        <SimpleGrid 
          columns={{ base: 1, md: 2, lg: 3 }} 
          gap={8} 
          justifyItems="center" 
          alignItems="stretch"
        >
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
    </Box>
  );
}
