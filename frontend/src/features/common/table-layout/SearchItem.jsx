import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { FcSearch } from "react-icons/fc";
import { useNavigate } from "react-router-dom";

export default function SearchItem({ placeholder = "Search" }) {
  const [search, setSearch] = useState("");
  const onChangeSearch = (e) => setSearch(e.currentTarget.value);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    const SEARCH_AFTER_TIME = 1500;
    searchRef.current = setTimeout(() => {
      navigate(search ? `?query=${search}` : "");
    }, SEARCH_AFTER_TIME);
  }, [search]);
  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <FcSearch color="gray.300" />
      </InputLeftElement>
      <Input
        required
        type="search"
        value={search}
        onChange={onChangeSearch}
        placeholder={placeholder}
      />
    </InputGroup>
  );
}
