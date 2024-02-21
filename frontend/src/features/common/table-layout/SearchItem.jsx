import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
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
    return ()=>{
      if(searchRef.current) clearTimeout(searchRef.current)
    }
  }, [search]);
  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <IoSearchOutline />
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
