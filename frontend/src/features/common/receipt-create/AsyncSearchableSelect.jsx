import { AsyncCreatableSelect } from "chakra-react-select";
import React, { useRef } from "react";
import instance from "../../../instance";

export default function AsyncSearchableSelect({
  url,
  optionsCb,
  onChange,
  onCreateOption,
  getParamsFromSearchQuery,
  value,
}) {
  const selectRef = useRef(null);

  const promiseOptions = async (searchQuery) => {
    if (selectRef.current) clearTimeout(selectRef.current);
    return new Promise((resolve, reject) => {
      selectRef.current = setTimeout(async () => {
        try {
          const { data } = await instance.get(
            url,
            getParamsFromSearchQuery(searchQuery)
          );
          const options = data.data.map(optionsCb);
          resolve(options);
        } catch (error) {
          reject(error);
        }
      }, 800);
    });
  };
  return (
    <AsyncCreatableSelect
      isClearable
      loadOptions={promiseOptions}
      onChange={onChange}
      value={value}
      onCreateOption={onCreateOption}
      createOptionPosition="first"
    />
  );
}
