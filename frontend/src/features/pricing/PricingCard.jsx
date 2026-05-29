import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  List,
  ListIcon,
  ListItem,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { FiCheck } from "react-icons/fi";
import AuthContext from "../../contexts/AuthContext";

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
  const activeBorderColor = useColorModeValue("blue.500", "blue.400");
  const inactiveBorderColor = useColorModeValue("gray.200", "whiteAlpha.200");

  return (
    <Flex
      direction="column"
      justify="space-between"
      bg={cardBg}
      border="2px solid"
      borderColor={isActive ? activeBorderColor : inactiveBorderColor}
      borderRadius="2xl"
      boxShadow={isActive ? "xl" : "md"}
      p={{ base: 6, md: 8 }}
      position="relative"
      maxW="sm"
      width="100%"
      h="100%"
    >
      {/* Badge at the top */}
      {isActive && (
        <Badge
          position="absolute"
          top="-4"
          left="50%"
          transform="translateX(-50%)"
          bg="blue.500"
          color="white"
          fontSize="xs"
          fontWeight="bold"
          px={4}
          py={1.5}
          borderRadius="full"
          boxShadow="md"
          letterSpacing="wider"
          textTransform="uppercase"
        >
          {t("pricing_ui.card.active")}
        </Badge>
      )}

      <Stack spacing={6}>
        <Box textAlign="center">
          <Heading
            textTransform="uppercase"
            fontSize="lg"
            fontWeight="bold"
            letterSpacing="widest"
            color={isActive ? "blue.500" : "gray.500"}
            mb={2}
          >
            {plan}
          </Heading>

          <Flex align="baseline" justify="center" mt={4}>
            <Text fontSize="2xl" fontWeight="semibold" color={useColorModeValue("gray.600", "gray.300")} mr={1}>
              ₹
            </Text>
            <Text fontSize="5xl" fontWeight="extrabold" letterSpacing="tight" color={useColorModeValue("gray.800", "white")}>
              {price}
            </Text>
            <Text fontSize="md" fontWeight="medium" color="gray.400" ml={1}>
              / yr
            </Text>
          </Flex>
        </Box>

        <List spacing={4} pt={4} borderTop="1px solid" borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}>
          {planOfferings.map((planOffering, index) => (
            <ListItem
              key={index}
              display="flex"
              alignItems="center"
              fontSize="sm"
              opacity={planOffering.available ? 1 : 0.4}
              color={planOffering.available ? useColorModeValue("gray.700", "gray.200") : "gray.500"}
              textDecoration={planOffering.available ? "none" : "line-through"}
            >
              <ListIcon
                as={FiCheck}
                color={planOffering.available ? "blue.500" : "gray.400"}
                w={5}
                h={5}
                p={0.5}
                bg={planOffering.available ? "blue.50" : "gray.100"}
                _dark={{
                  bg: planOffering.available ? "blue.900/30" : "whiteAlpha.100"
                }}
                borderRadius="full"
                mr={3}
              />
              <Text flex="1">{planOffering.label}</Text>
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
            as={"a"}
            href={`mailto:optimum.erp2024@gmail.com?subject=Upgrade to ${plan}&body=${t("pricing_ui.card.mailto_body")}`}
            borderRadius="xl"
            transition="all 0.2s"
          >
            {t("pricing_ui.card.upgrade")}
          </Button>
        ) : isActive ? (
          <Button
            w="full"
            size="lg"
            variant="outline"
            colorScheme="blue"
            isDisabled={true}
            borderRadius="xl"
            leftIcon={<Icon as={FiCheck} />}
          >
            {t("pricing_ui.card.active")}
          </Button>
        ) : null}
      </Box>
    </Flex>
  );
}
