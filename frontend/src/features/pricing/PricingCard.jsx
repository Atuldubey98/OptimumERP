/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  List,
  ListItem,
  Stack,
  Text,
  useColorModeValue,
  keyframes,
} from "@chakra-ui/react";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { FiCheck } from "react-icons/fi";
import { motion } from "framer-motion";
import AuthContext from "../../contexts/AuthContext";

const pulse = keyframes`
  0% { transform: scale(0.9); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.6; }
`;

export default function PricingCard({ plan, planOfferings, price }) {
  const { t } = useTranslation("party");
  const auth = useContext(AuthContext);

  const currentPlan = auth?.user?.currentPlan
    ? auth?.user?.currentPlan.plan
    : "free";

  const isActive = currentPlan === plan;

  const PLAN_RANKS = {
    free: 1,
    gold: 2,
    platinum: 3,
  };

  const currentRank = PLAN_RANKS[currentPlan.toLowerCase()] || 1;
  const targetRank = PLAN_RANKS[plan.toLowerCase()] || 1;

  const cardBg = useColorModeValue("white", "gray.800");
  const activeBorderColor = useColorModeValue("blue.400", "blue.500");
  const inactiveBorderColor = useColorModeValue("gray.100", "whiteAlpha.100");
  const activeShadow = useColorModeValue(
    "0 20px 40px -15px rgba(66, 153, 225, 0.25), 0 8px 16px -8px rgba(107, 70, 193, 0.15)",
    "0 20px 40px -15px rgba(107, 70, 193, 0.45), 0 8px 16px -8px rgba(66, 153, 225, 0.2)"
  );
  const inactiveShadow = useColorModeValue(
    "0 10px 30px -10px rgba(0,0,0,0.04)",
    "0 10px 30px -10px rgba(0,0,0,0.25)"
  );

  const headingColor = useColorModeValue("gray.400", "gray.500");
  const headingActiveColor = useColorModeValue("blue.500", "blue.300");
  const priceCurrencyColor = useColorModeValue("gray.500", "gray.400");
  const priceNumberColor = useColorModeValue("gray.800", "white");
  const dividerColor = useColorModeValue("gray.100", "whiteAlpha.100");
  const featureColor = useColorModeValue("gray.700", "gray.200");

  return (
    <Flex
      as={motion.div}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      direction="column"
      justify="space-between"
      bg={cardBg}
      border="1.5px solid"
      borderColor={isActive ? activeBorderColor : inactiveBorderColor}
      borderRadius="3xl"
      boxShadow={isActive ? activeShadow : inactiveShadow}
      p={{ base: 6, md: 8 }}
      position="relative"
      maxW="sm"
      width="100%"
      h="100%"
      overflow="hidden"
      transition="border-color 0.2s ease, box-shadow 0.2s ease"
    >
      {/* Badge at the top */}
      {isActive && (
        <Flex
          position="absolute"
          top="0"
          left="50%"
          transform="translateX(-50%)"
          bg="blue.500"
          color="white"
          fontSize="xs"
          fontWeight="extrabold"
          px={4}
          py={1.5}
          borderBottomRadius="xl"
          boxShadow="md"
          letterSpacing="wider"
          textTransform="uppercase"
          alignItems="center"
          gap={1.5}
        >
          <Box w={1.5} h={1.5} borderRadius="full" bg="white" animation={`${pulse} 2s infinite`} />
          {t("pricing_ui.card.active")}
        </Flex>
      )}

      <Stack spacing={6} pt={isActive ? 4 : 2}>
        <Box textAlign="center">
          <Heading
            textTransform="uppercase"
            fontSize="xs"
            fontWeight="black"
            letterSpacing="widest"
            color={isActive ? headingActiveColor : headingColor}
            mb={2}
          >
            {plan}
          </Heading>

          <Flex align="baseline" justify="center" mt={4}>
            <Text fontSize="2xl" fontWeight="semibold" color={priceCurrencyColor} mr={1}>
              ₹
            </Text>
            <Text fontSize="5xl" fontWeight="black" letterSpacing="tight" color={priceNumberColor}>
              {price}
            </Text>
            <Text fontSize="sm" fontWeight="semibold" color="gray.400" ml={1}>
              / yr
            </Text>
          </Flex>
        </Box>

        <List spacing={4} pt={6} borderTop="1px solid" borderColor={dividerColor}>
          {planOfferings.map((planOffering, index) => (
            <ListItem
              key={index}
              display="flex"
              alignItems="center"
              fontSize="sm"
              opacity={planOffering.available ? 1 : 0.4}
              color={planOffering.available ? featureColor : "gray.500"}
              textDecoration={planOffering.available ? "none" : "line-through"}
            >
              <Flex
                alignItems="center"
                justifyContent="center"
                w={5}
                h={5}
                borderRadius="full"
                bg={planOffering.available ? "blue.50" : "gray.100"}
                _dark={{
                  bg: planOffering.available ? "blue.900/30" : "whiteAlpha.100"
                }}
                mr={3}
                flexShrink={0}
              >
                <Icon
                  as={FiCheck}
                  color={planOffering.available ? "blue.500" : "gray.400"}
                  w={3.5}
                  h={3.5}
                />
              </Flex>
              <Text flex="1" fontWeight="medium">{planOffering.label}</Text>
            </ListItem>
          ))}
        </List>
      </Stack>

      <Box pt={8}>
        {targetRank > currentRank ? (
          <Button
            w="full"
            size="lg"
            variant="solid"
            colorScheme="blue"
            color="white"
            _hover={{
              bg: "blue.600",
              shadow: "lg",
              transform: "translateY(-1px)"
            }}
            _active={{
              transform: "translateY(0)"
            }}
            as={"a"}
            href={`mailto:optimum.erp2024@gmail.com?subject=Upgrade to ${plan}&body=${t("pricing_ui.card.mailto_body")}`}
            borderRadius="2xl"
            fontWeight="bold"
            fontSize="sm"
            transition="all 0.2s"
          >
            {t("pricing_ui.card.upgrade")}
          </Button>
        ) : isActive ? (
          <Button
            w="full"
            size="lg"
            variant="outline"
            borderColor="blue.400"
            color="blue.400"
            _dark={{
              borderColor: "blue.500",
              color: "blue.300"
            }}
            isDisabled={true}
            borderRadius="2xl"
            fontWeight="bold"
            fontSize="sm"
            leftIcon={<Icon as={FiCheck} />}
          >
            {t("pricing_ui.card.active")}
          </Button>
        ) : null}
      </Box>
    </Flex>
  );
}
