import React from "react";
import {
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { CreatableSelect } from "chakra-react-select";
import { useTranslation } from "react-i18next";
import { FiTrash2 } from "react-icons/fi";

export default function TransactionPrefixItem({
  prefixKey,
  label,
  formik,
  isDisabled,
}) {
  const { t } = useTranslation("common");

  const rawPrefixes = formik.values.prefixes?.[prefixKey] || [""];
  const prefixes = Array.from(new Set(["", ...rawPrefixes]));
  const activePrefix = formik.values[prefixKey] ?? "";

  const options = prefixes.map((p) => ({
    value: p,
    label: p ? p : t("common_ui.transaction_settings.none", "None"),
  }));

  const selectedOption =
    options.find((opt) => opt.value === activePrefix) ||
    (activePrefix ? { value: activePrefix, label: activePrefix } : options[0]);

  const handleCreatePrefix = (inputValue) => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    if (!prefixes.includes(trimmed)) {
      formik.setFieldValue(`prefixes.${prefixKey}`, [...prefixes, trimmed]);
    }
    formik.setFieldValue(prefixKey, trimmed);
  };

  const handleChangeSelect = (option) => {
    formik.setFieldValue(prefixKey, option ? option.value : "");
  };

  const handleDeletePrefix = (prefixToDelete) => {
    const updated = prefixes.filter((p) => p !== prefixToDelete);
    formik.setFieldValue(
      `prefixes.${prefixKey}`,
      updated.length > 0 ? updated : [""]
    );

    if (activePrefix === prefixToDelete) {
      formik.setFieldValue(prefixKey, "");
    }
  };

  return (
    <FormControl isDisabled={isDisabled}>
      <FormLabel fontWeight="600" fontSize="sm">
        {label}
      </FormLabel>
      <CreatableSelect
        isClearable
        name={prefixKey}
        value={selectedOption}
        options={options}
        isDisabled={isDisabled}
        onChange={handleChangeSelect}
        onCreateOption={handleCreatePrefix}
        placeholder={t(
          "common_ui.transaction_settings.select_or_type_prefix",
          "Select or type to create..."
        )}
        formatCreateLabel={(inputValue) =>
          t(
            "common_ui.transaction_settings.create_prefix_action",
            `+ Add "${inputValue}"`
          )
        }
        formatOptionLabel={(option, { context }) => {
          if (context === "value") {
            return <Text fontSize="sm">{option.label}</Text>;
          }
          return (
            <Flex justify="space-between" align="center" width="100%">
              <Text fontSize="sm">{option.label}</Text>
              {option.value !== "" && (
                <IconButton
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  icon={<FiTrash2 size={12} />}
                  aria-label="Delete prefix"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleDeletePrefix(option.value);
                  }}
                />
              )}
            </Flex>
          );
        }}
        chakraStyles={{
          control: (provided) => ({
            ...provided,
            borderRadius: "md",
            fontSize: "14px",
          }),
          menuList: (provided) => ({
            ...provided,
            py: 1,
          }),
        }}
      />
    </FormControl>
  );
}
