import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import React, { useMemo } from "react";
import useAsyncCall from "../../hooks/useAsyncCall";
import useProperty from "../../hooks/useProperty";
import instance from "../../instance";

export default function NewOrgModal({
  isOpen: isOpenNewOrgModal,
  onCloseNewOrgModal,
  onAddedFetch,
}) {
  const { t } = useTranslation("org");
  const { requestAsyncHandler } = useAsyncCall();

  const { value: currencies = {} } = useProperty("CURRENCIES_CONFIG");
  const { value: countries = [] } = useProperty("COUNTRIES_CONFIG");

  const date = new Date();
  const formik = useFormik({
    initialValues: {
      name: "",
      address: "",
      gstNo: "",
      panNo: "",
      financialYearStart: `${date.getFullYear()}-04-01`,
      financialYearEnd: `${date.getFullYear() + 1}-03-31`,
      currency: "INR",
      localeCode: "en-IN",
      countryCode3: "",
      stateCode: "",
    },
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const {
        financialYearEnd,
        financialYearStart,
        countryCode3,
        stateCode,
        ...restOrg
      } = values;
      await instance.post(`/api/v1/organizations`, {
        ...restOrg,
        financialYear: { start: financialYearStart, end: financialYearEnd },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...(countryCode3 && {
          location: {
            countryCode3,
            ...(stateCode && { stateCode }),
          },
        }),
      });
      onAddedFetch();
      onCloseNewOrgModal();
      formik.resetForm();
      setSubmitting(false);
    }),
  });

  // Build currency options
  const currencyOptions = useMemo(
    () =>
      Object.keys(currencies).map((code) => ({
        label: `${currencies[code].name} (${code}) ${currencies[code].symbol}`,
        value: code,
      })),
    [currencies]
  );

  // Build country options
  const countryOptions = useMemo(
    () =>
      countries.map((c) => ({
        label: c.name,
        value: c.code3,
      })),
    [countries]
  );

  // Build state options based on selected country
  const stateOptions = useMemo(() => {
    const selectedCountry = countries.find(
      (c) => c.code3 === formik.values.countryCode3
    );
    if (!selectedCountry?.states?.length) return [];
    return selectedCountry.states.map((s) => ({
      label: s.name,
      value: s.code,
    }));
  }, [countries, formik.values.countryCode3]);

  return (
    <Modal size={"xl"} isOpen={isOpenNewOrgModal} onClose={onCloseNewOrgModal}>
      <ModalOverlay />
      <form onSubmit={formik.handleSubmit}>
        <ModalContent>
          <ModalHeader>{t("org_ui.new_org_modal.header")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid gap={4}>
              {/* Name */}
              <FormControl
                isRequired
                isInvalid={formik.errors.name && formik.touched.name}
              >
                <FormLabel>{t("org_ui.new_org_modal.name_label")}</FormLabel>
                <Input
                  autoFocus
                  onChange={formik.handleChange}
                  name="name"
                  type="text"
                  value={formik.values.name}
                  placeholder={t("org_ui.new_org_modal.name_placeholder")}
                />
                <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
                <FormHelperText>{t("org_ui.new_org_modal.name_helper")}</FormHelperText>
              </FormControl>

              {/* Address */}
              <FormControl
                isRequired
                isInvalid={formik.errors.address && formik.touched.address}
              >
                <FormLabel>{t("org_ui.new_org_modal.address_label")}</FormLabel>
                <Input
                  onChange={formik.handleChange}
                  name="address"
                  type="text"
                  value={formik.values.address}
                  placeholder={t("org_ui.new_org_modal.address_placeholder")}
                />
                <FormErrorMessage>{formik.errors.address}</FormErrorMessage>
                <FormHelperText>{t("org_ui.new_org_modal.address_helper")}</FormHelperText>
              </FormControl>

              {/* GST No */}
              <FormControl
                isInvalid={formik.errors.gstNo && formik.touched.gstNo}
              >
                <FormLabel>{t("org_ui.new_org_modal.gst_label")}</FormLabel>
                <Input
                  onChange={formik.handleChange}
                  name="gstNo"
                  type="text"
                  value={formik.values.gstNo}
                  placeholder={t("org_ui.new_org_modal.gst_placeholder")}
                />
                <FormErrorMessage>{formik.errors.gstNo}</FormErrorMessage>
                <FormHelperText>
                  {t("org_ui.new_org_modal.gst_helper")}
                </FormHelperText>
              </FormControl>

              {/* PAN No */}
              <FormControl
                isRequired
                isInvalid={formik.errors.panNo && formik.touched.panNo}
              >
                <FormLabel>{t("org_ui.new_org_modal.pan_label")}</FormLabel>
                <Input
                  onChange={formik.handleChange}
                  name="panNo"
                  type="text"
                  value={formik.values.panNo}
                  placeholder={t("org_ui.new_org_modal.pan_placeholder")}
                />
                <FormErrorMessage>{formik.errors.panNo}</FormErrorMessage>
                <FormHelperText>
                  {t("org_ui.new_org_modal.pan_helper")}
                </FormHelperText>
              </FormControl>

              <Text fontSize={"sm"}>
                {t("org_ui.new_org_modal.rest_details_note")}
              </Text>
              <Divider />

              {/* Currency */}
              <FormControl isRequired>
                <FormLabel>Currency</FormLabel>
                <Select
                  name="currency"
                  options={currencyOptions}
                  value={
                    currencyOptions.find(
                      (opt) => opt.value === formik.values.currency
                    ) || null
                  }
                  onChange={({ value }) => {
                    formik.setFieldValue("currency", value);
                    const localeCode = currencies[value]?.localCode || "en-IN";
                    formik.setFieldValue("localeCode", localeCode);
                  }}
                  placeholder="Select currency..."
                />
                <FormHelperText>
                  Sets the default currency for all invoices in this organization.
                </FormHelperText>
              </FormControl>

              {/* Country */}
              <FormControl>
                <FormLabel>Country</FormLabel>
                <Select
                  name="countryCode3"
                  options={countryOptions}
                  value={
                    countryOptions.find(
                      (opt) => opt.value === formik.values.countryCode3
                    ) || null
                  }
                  onChange={(selected) => {
                    formik.setFieldValue(
                      "countryCode3",
                      selected ? selected.value : ""
                    );
                    formik.setFieldValue("stateCode", "");
                  }}
                  isClearable
                  placeholder="Select country..."
                />
              </FormControl>

              {/* State — only shown when a country with states is selected */}
              {stateOptions.length > 0 && (
                <FormControl>
                  <FormLabel>State / Province</FormLabel>
                  <Select
                    name="stateCode"
                    options={stateOptions}
                    value={
                      stateOptions.find(
                        (opt) => opt.value === formik.values.stateCode
                      ) || null
                    }
                    onChange={(selected) => {
                      formik.setFieldValue(
                        "stateCode",
                        selected ? selected.value : ""
                      );
                    }}
                    isClearable
                    placeholder="Select state..."
                  />
                </FormControl>
              )}

              <Divider />

              {/* Financial Year */}
              <Grid>
                <Text fontWeight={"bold"} fontSize={"md"}>
                  {t("org_ui.new_org_modal.fiscal_year_heading")}
                </Text>
                <Flex gap={3}>
                  <FormControl isRequired>
                    <FormLabel>{t("org_ui.new_org_modal.start_date_label")}</FormLabel>
                    <Input
                      name="financialYearStart"
                      value={formik.values.financialYearStart}
                      onChange={formik.handleChange}
                      placeholder={t("org_ui.new_org_modal.date_placeholder")}
                      type="date"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>{t("org_ui.new_org_modal.end_date_label")}</FormLabel>
                    <Input
                      value={formik.values.financialYearEnd}
                      placeholder={t("org_ui.new_org_modal.date_placeholder")}
                      type="date"
                      name="financialYearEnd"
                      onChange={formik.handleChange}
                    />
                  </FormControl>
                </Flex>
                <Box marginBlock={2}>
                  <Text fontSize={"sm"}>
                    {t("org_ui.new_org_modal.fiscal_year_note")}
                  </Text>
                </Box>
              </Grid>
              <Divider />
            </Grid>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              mr={3}
              variant={"ghost"}
              onClick={onCloseNewOrgModal}
            >
              {t("org_ui.new_org_modal.close_button")}
            </Button>
            <Button
              isLoading={formik.isSubmitting}
              type="submit"
              colorScheme="blue"
            >
              {t("org_ui.new_org_modal.submit_button")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
}
