import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import React from "react";
import { FcSearch } from "react-icons/fc";
import { useTranslation } from "react-i18next";

export default function SearchParty() {
  const { t } = useTranslation("common");
  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <FcSearch color="gray.300" />
      </InputLeftElement>
      <Input type="tel" placeholder={t("common_ui.search.parties")} />
    </InputGroup>
  );
}
