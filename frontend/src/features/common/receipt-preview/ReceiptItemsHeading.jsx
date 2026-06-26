import {
    Grid,
    GridItem,
    Text
} from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";
export default function ReceiptItemsHeading(props) {
  const { t } = useTranslation("common");
  return (
    <Grid
      fontWeight={"bold"}
      gap={2}
      bg={props.tableHeader}
      p={5}
      templateColumns={"4fr 1fr 1fr 1fr 1fr"}
      display={{ base: "none", md: "grid" }}
    >
      <GridItem>
        <Text textAlign={"left"}>{t("common_ui.receipt.product")}</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"right"}>{t("common_ui.receipt.quantity")}</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"right"}>{t("common_ui.receipt.price")}</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"right"}>{t("common_ui.receipt.tax")}</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"right"}>{t("common_ui.receipt.total")}</Text>
      </GridItem>
    </Grid>
  );
}
