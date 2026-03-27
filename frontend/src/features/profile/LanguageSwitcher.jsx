import React from "react";
import { useTranslation } from "react-i18next";
import { Select } from "chakra-react-select";
import { FormControl, FormLabel, Box, Text, HStack } from "@chakra-ui/react";

const options = [
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
];

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation("common");

  const currentOption =
    options.find((o) => o.value === i18n.language) || options[0];

  const handleChange = (selected) => {
    console.log(selected);

    if (selected) {
      i18n.changeLanguage(selected.value);
    }
  };

  return (
    <Box w="full" maxW="300px">
      <FormControl id="language-selection">
        <FormLabel fontSize="sm" fontWeight="bold" mb={2}>
          {t("language_label", "Select Language")}
        </FormLabel>

        <Select
       

          options={options}
          value={currentOption}
          onChange={handleChange}
          isSearchable={false}
         
        />
      </FormControl>
    </Box>
  );
};

export default LanguageSwitcher;
