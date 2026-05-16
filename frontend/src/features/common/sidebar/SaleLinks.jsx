import { List } from "@chakra-ui/react";
import React from "react";
import saleLinks from "../../../constants/saleLinks";
import HeaderLink from "./HeaderLink";
import useAuth from "../../../hooks/useAuth";

export default function SaleLinks() {
  const { user } = useAuth();
  const currentFeatures = user?.features || {};

  return (
    <List marginLeft={3} spacing={1}>
      {saleLinks
        .filter((saleLink) => 
          saleLink.feature ? currentFeatures[saleLink.feature] : true
        )
        .map((saleLink) => (
          <HeaderLink
            headerLink={saleLink}
            key={saleLink.link}
          />
        ))}
    </List>
  );
}
