import {
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";

export default function ReceiptItem(props) {
  const { formatSmallestUnitWithSymbol } = useCurrentOrgCurrency();
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  return (
    <>
      {/* Desktop Layout */}
      <Grid
        p={4}
        gap={2}
        templateColumns={"4fr 1fr 1fr 1fr 1fr"}
        display={{ base: "none", md: "grid" }}
        alignItems="center"
        borderBottom="1px"
        borderColor={borderColor}
      >
        <GridItem>
          <Text fontWeight="semibold">{props.item.name}</Text>
          {props.item.code && (
            <Text fontSize="xs" color={subTextColor}>
              {props.item.code}
            </Text>
          )}
        </GridItem>
        <GridItem>
          <Text textAlign={"right"}>{props.item.quantity}</Text>
        </GridItem>
        <GridItem>
          <Text textAlign={"right"}>
            {formatSmallestUnitWithSymbol(props.item.price)}
          </Text>
        </GridItem>
        <GridItem>
          <Text textAlign={"right"}>{props.item.tax.name}</Text>
        </GridItem>
        <GridItem>
          <Text textAlign={"right"} fontWeight="semibold">
            {formatSmallestUnitWithSymbol(props.item.price * props.item.quantity)}
          </Text>
        </GridItem>
      </Grid>

      {/* Mobile Layout */}
      <Box
        p={4}
        display={{ base: "block", md: "none" }}
        borderBottom="1px"
        borderColor={borderColor}
      >
        <Flex justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box pr={2}>
            <Text fontWeight="semibold" fontSize="sm">
              {props.item.name}
            </Text>
            {props.item.code && (
              <Text fontSize="xs" color={subTextColor}>
                {props.item.code}
              </Text>
            )}
          </Box>
          <Text fontWeight="bold" fontSize="sm" textAlign="right">
            {formatSmallestUnitWithSymbol(props.item.price * props.item.quantity)}
          </Text>
        </Flex>
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="xs" color={subTextColor}>
            {props.item.quantity} × {formatSmallestUnitWithSymbol(props.item.price)}
          </Text>
          {props.item.tax?.name && (
            <Text fontSize="xs" color={subTextColor}>
              Tax: {props.item.tax.name}
            </Text>
          )}
        </Flex>
      </Box>
    </>
  );
}
