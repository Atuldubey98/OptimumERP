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
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
  useColorModeValue,
  Icon,
  VStack,
  Heading,
  Spacer,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineBuildingOffice,
  HiOutlineIdentification,
  HiOutlineGlobeAlt,
  HiOutlineCalendarDays,
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineCheck,
} from "react-icons/hi2";
import useAsyncCall from "../../hooks/useAsyncCall";
import useProperty from "../../hooks/useProperty";
import instance from "../../instance";

const MotionBox = motion(Box);

export default function NewOrgModal({
  isOpen: isOpenNewOrgModal,
  onCloseNewOrgModal,
  onAddedFetch,
}) {
  const { t } = useTranslation("org");
  const { requestAsyncHandler } = useAsyncCall();

  const { value: currencies = {} } = useProperty("CURRENCIES_CONFIG");
  const { value: countries = [] } = useProperty("COUNTRIES_CONFIG");

  const steps = [
    {
      title: t("org_ui.new_org_modal.steps.identity.title"),
      description: t("org_ui.new_org_modal.steps.identity.description"),
      icon: HiOutlineBuildingOffice,
    },
    {
      title: t("org_ui.new_org_modal.steps.business.title"),
      description: t("org_ui.new_org_modal.steps.business.description"),
      icon: HiOutlineIdentification,
    },
    {
      title: t("org_ui.new_org_modal.steps.regional.title"),
      description: t("org_ui.new_org_modal.steps.regional.description"),
      icon: HiOutlineGlobeAlt,
    },
    {
      title: t("org_ui.new_org_modal.steps.fiscal.title"),
      description: t("org_ui.new_org_modal.steps.fiscal.description"),
      icon: HiOutlineCalendarDays,
    },
  ];

  const { activeStep, goToNext, goToPrevious, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

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
      handleClose();
      setSubmitting(false);
    }),
  });

  const handleClose = () => {
    onCloseNewOrgModal();
    setActiveStep(0);
    formik.resetForm();
  };

  const isStepValid = () => {
    if (activeStep === 0) {
      return formik.values.name && formik.values.address;
    }
    if (activeStep === 1) {
      return formik.values.panNo;
    }
    if (activeStep === 2) {
      return formik.values.currency;
    }
    return true;
  };

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

  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Modal
      size={"2xl"}
      isOpen={isOpenNewOrgModal}
      onClose={handleClose}
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl" overflow="hidden">
        <ModalHeader borderBottomWidth="1px" borderColor={borderColor} py={6}>
          <VStack align="start" spacing={1}>
            <Heading size="md">{t("org_ui.new_org_modal.header")}</Heading>
            <Text fontSize="sm" color="gray.500" fontWeight="normal">
              {t("org_ui.new_org_modal.subheader")}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton top={6} />
        
        <ModalBody py={8}>
          <Stepper index={activeStep} colorScheme="blue" mb={10} size="sm">
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>

                <Box flexShrink='0' display={{ base: "none", md: "block" }}>
                  <StepTitle>{step.title}</StepTitle>
                </Box>

                <StepSeparator />
              </Step>
            ))}
          </Stepper>

          <form onSubmit={formik.handleSubmit}>
            <AnimatePresence mode="wait">
              <MotionBox
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                minH="300px"
              >
                {activeStep === 0 && (
                  <VStack spacing={6} align="stretch">
                    <Flex align="center" gap={3} mb={2}>
                      <Icon as={HiOutlineBuildingOffice} boxSize={6} color="blue.500" />
                      <Heading size="sm">{t("org_ui.new_org_modal.steps.identity.heading")}</Heading>
                    </Flex>
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
                        size="lg"
                        borderRadius="xl"
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
                        size="lg"
                        borderRadius="xl"
                      />
                      <FormErrorMessage>{formik.errors.address}</FormErrorMessage>
                      <FormHelperText>{t("org_ui.new_org_modal.address_helper")}</FormHelperText>
                    </FormControl>
                  </VStack>
                )}

                {activeStep === 1 && (
                  <VStack spacing={6} align="stretch">
                    <Flex align="center" gap={3} mb={2}>
                      <Icon as={HiOutlineIdentification} boxSize={6} color="blue.500" />
                      <Heading size="sm">{t("org_ui.new_org_modal.steps.business.heading")}</Heading>
                    </Flex>
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
                        size="lg"
                        borderRadius="xl"
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
                        size="lg"
                        borderRadius="xl"
                      />
                      <FormErrorMessage>{formik.errors.panNo}</FormErrorMessage>
                      <FormHelperText>
                        {t("org_ui.new_org_modal.pan_helper")}
                      </FormHelperText>
                    </FormControl>
                  </VStack>
                )}

                {activeStep === 2 && (
                  <VStack spacing={6} align="stretch">
                    <Flex align="center" gap={3} mb={2}>
                      <Icon as={HiOutlineGlobeAlt} boxSize={6} color="blue.500" />
                      <Heading size="sm">{t("org_ui.new_org_modal.steps.regional.heading")}</Heading>
                    </Flex>
                    
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
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
                          chakraStyles={{
                            control: (provided) => ({
                              ...provided,
                              borderRadius: "xl",
                              height: "48px"
                            })
                          }}
                        />
                      </FormControl>

                      {/* State */}
                      <FormControl isDisabled={stateOptions.length === 0}>
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
                          chakraStyles={{
                            control: (provided) => ({
                              ...provided,
                              borderRadius: "xl",
                              height: "48px"
                            })
                          }}
                        />
                      </FormControl>
                    </Grid>

                    {/* Currency */}
                    <FormControl isRequired>
                      <FormLabel>Default Currency</FormLabel>
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
                        chakraStyles={{
                          control: (provided) => ({
                            ...provided,
                            borderRadius: "xl",
                            height: "48px"
                          })
                        }}
                      />
                      <FormHelperText>
                        Used for all invoices in this organization.
                      </FormHelperText>
                    </FormControl>
                  </VStack>
                )}

                {activeStep === 3 && (
                  <VStack spacing={6} align="stretch">
                    <Flex align="center" gap={3} mb={2}>
                      <Icon as={HiOutlineCalendarDays} boxSize={6} color="blue.500" />
                      <Heading size="sm">{t("org_ui.new_org_modal.steps.fiscal.heading")}</Heading>
                    </Flex>
                    
                    <Text fontSize="sm" color="gray.500">
                      {t("org_ui.new_org_modal.fiscal_year_note")}
                    </Text>

                    <Grid templateColumns="1fr 1fr" gap={6}>
                      <FormControl isRequired>
                        <FormLabel>{t("org_ui.new_org_modal.start_date_label")}</FormLabel>
                        <Input
                          name="financialYearStart"
                          value={formik.values.financialYearStart}
                          onChange={formik.handleChange}
                          type="date"
                          size="lg"
                          borderRadius="xl"
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>{t("org_ui.new_org_modal.end_date_label")}</FormLabel>
                        <Input
                          value={formik.values.financialYearEnd}
                          type="date"
                          name="financialYearEnd"
                          onChange={formik.handleChange}
                          size="lg"
                          borderRadius="xl"
                        />
                      </FormControl>
                    </Grid>
                    
                    <Box p={4} bg="blue.50" borderRadius="xl" borderLeft="4px solid" borderLeftColor="blue.400">
                      <Text fontSize="xs" color="blue.700">
                        {t("org_ui.new_org_modal.rest_details_note")}
                      </Text>
                    </Box>
                  </VStack>
                )}
              </MotionBox>
            </AnimatePresence>
          </form>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor={borderColor} gap={3} py={6}>
          <Button
            variant="ghost"
            onClick={activeStep === 0 ? handleClose : goToPrevious}
            leftIcon={activeStep !== 0 ? <HiOutlineArrowLeft /> : undefined}
            borderRadius="xl"
          >
            {activeStep === 0 ? t("org_ui.new_org_modal.cancel_button") : t("org_ui.new_org_modal.back_button")}
          </Button>
          
          <Spacer />

          {activeStep < steps.length - 1 ? (
            <Button
              colorScheme="blue"
              onClick={goToNext}
              isDisabled={!isStepValid()}
              rightIcon={<HiOutlineArrowRight />}
              borderRadius="xl"
              px={8}
            >
              {t("org_ui.new_org_modal.continue_button")}
            </Button>
          ) : (
            <Button
              colorScheme="blue"
              isLoading={formik.isSubmitting}
              onClick={formik.handleSubmit}
              rightIcon={<HiOutlineCheck />}
              borderRadius="xl"
              px={8}
            >
              {t("org_ui.new_org_modal.complete_button")}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

