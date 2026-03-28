import { Button, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import React, { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { createSearchParams, useNavigate } from "react-router-dom";
import useQuery from "../../../hooks/useQuery";
export default function SearchItem({ placeholder }) {
  const { t } = useTranslation("common");
  const query = useQuery();
  const [search, setSearch] = useState(query.get("query") || "");
  const onChangeSearch = (e) => setSearch(e.currentTarget.value);
  const navigate = useNavigate();
  const onSubmit = (e) => {
    e.preventDefault();
    navigate({
      pathname: ``,
      search: createSearchParams({
        query: search,
        page: search ? 1 : query.get("page"),
      }).toString(),
    });
  };
  return (
    <form onSubmit={onSubmit}>
      <InputGroup margin={"auto"}>
        <InputLeftElement pointerEvents="none">
          <IoSearchOutline />
        </InputLeftElement>
        <Input
          type="search"
          value={search}
          onChange={onChangeSearch}
          placeholder={placeholder || t("common_ui.search.placeholder")}
        />
      </InputGroup>
      <Button display={"none"}/>
    </form>
  );
}
