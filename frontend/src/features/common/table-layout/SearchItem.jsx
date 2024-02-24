import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import useQuery from "../../../hooks/useQuery";
export default function SearchItem({ placeholder = "Search" }) {
  const query = useQuery();
  const [search, setSearch] = useState(query.get("query"));
  const onChangeSearch = (e) => setSearch(e.currentTarget.value);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const SEARCH_AFTER_TIME = 1500;
    searchRef.current = setTimeout(() => {
      navigate(search ? `?query=${search}` : "");
    }, SEARCH_AFTER_TIME);
    return ()=>{
      if(searchRef.current) clearTimeout(searchRef.current)
    }
  }, [search, searchRef]);
  return (
    <InputGroup margin={"auto"}>
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
