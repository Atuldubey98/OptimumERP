import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Heading,
  Input,
  SimpleGrid,
  Spinner,
  Textarea,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  List,
  ListItem,
  ListIcon,
  Text,
  Badge,
  Checkbox,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { FormikProvider } from "formik";
import moment from "moment";
import { useDeferredValue, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AiOutlineSave } from "react-icons/ai";
import { recurringInvoiceStatusList, intervalOptions, dayOptions, dateOptions } from "../../../constants/recurringInvoice";
import useRecurringInvoicesForm from "../../../hooks/useRecurringInvoicesForm";
import useLimitsInFreePlan from "../../../hooks/useLimitsInFreePlan";
import MainLayout from "../../common/main-layout";
import DescriptionField from "../../estimates/create/DescriptionField";
import ItemsList from "../../estimates/create/ItemList";
import SelectStatus from "../../estimates/create/SelectStatus";
import TermsAndCondtions from "../../estimates/create/TermsConditions";
import TotalsBox from "../../estimates/create/TotalsBox";
import PartySelectBill from "../../invoices/create/PartySelectBill";
import useTaxes from "../../../hooks/useTaxes";
import useUms from "../../../hooks/useUms";
import BannerWithLabel from "../../common/BannerWithLabel";
import { MdCached, MdCheckCircle } from "react-icons/md";
import { calculateRecurringDates } from "../../../utils/recurringDates";

export default function RecurringInvoiceFormPage() {
  const { t } = useTranslation("recurringInvoice");
  const { taxes } = useTaxes();
  const { ums } = useUms();
  const { formik, status } = useRecurringInvoicesForm();

  const deferredItems = useDeferredValue(formik.values.items);
  const loading = status === "loading";
  
  const { disable } = useLimitsInFreePlan({
    key: "recurringInvoices",
  });
  
  const hasError = status === "error";
  const memoizedIntervalOptions = useMemo(() => intervalOptions.map(opt => ({ label: t(opt.label), value: opt.value })), [t]);
  const memoizedDayOptions = useMemo(() => dayOptions.map(opt => ({ label: t(opt.label), value: opt.value })), [t]);
  const memoizedDateOptions = useMemo(() => dateOptions, []);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const occurrences = useMemo(() => {
    return calculateRecurringDates({
      startDate: formik.values.startDate,
      endDate: formik.values.endDate,
      interval: formik.values.interval,
      dateOfEveryMonth: formik.values.dateOfEveryMonth,
      dayOfEveryWeek: formik.values.dayOfEveryWeek,
    });
  }, [formik.values.startDate, formik.values.endDate, formik.values.interval, formik.values.dateOfEveryMonth, formik.values.dayOfEveryWeek]);

  const handleSaveClick = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length === 0) {
      if (formik.values._id) {
        formik.handleSubmit();
      } else {
        onOpen();
      }
    } else {
      formik.handleSubmit();
    }
  };

  return (
    <Box p={5}>
      <FormikProvider value={formik}>
        {loading ? (
          <Flex justifyContent={"center"} alignItems={"center"}>
            <Spinner size={"md"} />
          </Flex>
        ) : hasError ? (
          <BannerWithLabel
            label={t("recurring_invoice_ui.page.not_found")}
            Icon={MdCached}
          />
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <Flex gap={5} justifyContent={"flex-end"} alignItems={"center"} mb={4}>
              <Button
                isDisabled={formik.values._id ? false : disable}
                leftIcon={<AiOutlineSave />}
                isLoading={formik.isSubmitting || loading}
                onClick={handleSaveClick}
                colorScheme="teal"
                variant="solid"
              >
                {t("recurring_invoice_ui.form.save_button")}
              </Button>
            </Flex>
            <Grid gap={6}>
              <Heading fontSize={"xl"}>{t("recurring_invoice_ui.form.party_section")}</Heading>
              <FormControl
                isInvalid={formik.errors.party && formik.touched.party}
                isRequired
              >
                <FormLabel>{t("recurring_invoice_ui.form.bill_to")}</FormLabel>
                <PartySelectBill formik={formik} />
                <FormErrorMessage>{formik.errors.party}</FormErrorMessage>
              </FormControl>
              {formik.values.party ? (
                <FormControl
                  isInvalid={
                    formik.errors.billingAddress &&
                    formik.touched.billingAddress
                  }
                  isRequired
                >
                  <FormLabel>{t("recurring_invoice_ui.form.billing_address")}</FormLabel>
                  <Textarea
                    name="billingAddress"
                    onChange={formik.handleChange}
                    value={formik.values.billingAddress}
                  />
                  <FormErrorMessage>
                    {formik.errors.billingAddress}
                  </FormErrorMessage>
                </FormControl>
              ) : null}

              <Heading fontSize={"xl"}>{t("recurring_invoice_ui.form.frequency_section")}</Heading>
              <SimpleGrid gap={4} minChildWidth={250}>
                <FormControl
                  isInvalid={formik.errors.interval && formik.touched.interval}
                  isRequired
                  isDisabled={!!formik.values._id}
                >
                  <FormLabel>{t("recurring_invoice_ui.form.interval")}</FormLabel>
                  <Select
                    name="interval"
                    onChange={(option) => formik.setFieldValue("interval", option.value)}
                    value={memoizedIntervalOptions.find(opt => opt.value === formik.values.interval)}
                    options={memoizedIntervalOptions}
                  />
                  <FormErrorMessage>{formik.errors.interval}</FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={formik.errors.startDate && formik.touched.startDate}
                  isRequired
                  isDisabled={!!formik.values._id}
                >
                  <FormLabel>{t("recurring_invoice_ui.form.start_date")}</FormLabel>
                  <Input
                    name="startDate"
                    type="date"
                    onChange={formik.handleChange}
                    value={formik.values.startDate}
                  />
                  <FormErrorMessage>{formik.errors.startDate}</FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={formik.errors.endDate && formik.touched.endDate}
                  isDisabled={!!formik.values._id}
                >
                  <FormLabel>{t("recurring_invoice_ui.form.end_date")}</FormLabel>
                  <Input
                    name="endDate"
                    type="date"
                    onChange={formik.handleChange}
                    value={formik.values.endDate}
                  />
                  <FormErrorMessage>{formik.errors.endDate}</FormErrorMessage>
                </FormControl>

                {formik.values.interval === 'weekly' && (
                  <FormControl
                    isInvalid={formik.errors.dayOfEveryWeek && formik.touched.dayOfEveryWeek}
                    isRequired
                    isDisabled={!!formik.values._id}
                  >
                    <FormLabel>{t("recurring_invoice_ui.form.day_of_week")}</FormLabel>
                    <Select
                      name="dayOfEveryWeek"
                      onChange={(option) => formik.setFieldValue("dayOfEveryWeek", option.value)}
                      value={memoizedDayOptions.find(opt => opt.value === formik.values.dayOfEveryWeek)}
                      options={memoizedDayOptions}
                    />
                    <FormErrorMessage>{formik.errors.dayOfEveryWeek}</FormErrorMessage>
                  </FormControl>
                )}

                {['monthly', 'quarterly', 'half_yearly', 'yearly'].includes(formik.values.interval) && (
                  <FormControl
                    isInvalid={formik.errors.dateOfEveryMonth && formik.touched.dateOfEveryMonth}
                    isRequired
                    isDisabled={!!formik.values._id}
                  >
                    <FormLabel>{t("recurring_invoice_ui.form.date_of_month")}</FormLabel>
                    <Select
                      name="dateOfEveryMonth"
                      onChange={(option) => formik.setFieldValue("dateOfEveryMonth", option.value)}
                      value={memoizedDateOptions.find(opt => opt.value === Number(formik.values.dateOfEveryMonth))}
                      options={memoizedDateOptions}
                    />
                    <FormErrorMessage>{formik.errors.dateOfEveryMonth}</FormErrorMessage>
                  </FormControl>
                )}

                <SelectStatus
                  formik={formik}
                  statusList={recurringInvoiceStatusList}
                  namespace="recurringInvoice"
                />

                <FormControl gridColumn={{ md: "span 2" }}>
                  <FormLabel>{t("recurring_invoice_ui.form.generation_options")}</FormLabel>
                  <Flex gap={5} direction={{ base: "column", md: "row" }}>
                    <Checkbox
                      name="generateInvoice"
                      isChecked={formik.values.generateInvoice}
                      onChange={formik.handleChange}
                      colorScheme="teal"
                    >
                      {t("recurring_invoice_ui.form.generate_invoice")}
                    </Checkbox>
                    <Checkbox
                      name="generateProformaInvoice"
                      isChecked={formik.values.generateProformaInvoice}
                      onChange={formik.handleChange}
                      colorScheme="teal"
                    >
                      {t("recurring_invoice_ui.form.generate_proforma_invoice")}
                    </Checkbox>
                  </Flex>
                </FormControl>
              </SimpleGrid>

              <Heading fontSize={"xl"}>{t("recurring_invoice_ui.form.items_section")}</Heading>
              <ItemsList
                formik={formik}
                taxes={taxes}
                ums={ums}
                namespace="invoice"
              />
              <TotalsBox
                quoteItems={deferredItems}
                taxes={taxes}
                shippingCharges={formik.values.shippingCharges ?? ""}
                onShippingChargesChange={(value) => {
                  formik.setFieldValue("shippingCharges", value);
                }}
              />
              <DescriptionField formik={formik} />
              <TermsAndCondtions formik={formik} />
            </Grid>
          </form>
        )}
      </FormikProvider>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>{t("recurring_invoice_ui.modal.confirm_save_header")}</ModalHeader>
          <ModalBody>
            <Box mb={4}>
              <Text fontWeight="bold" mb={2}>
                {t("recurring_invoice_ui.modal.summary_text", { count: occurrences.length })}
              </Text>
              <Text fontSize="sm" color="gray.500" mb={4}>
                {t("recurring_invoice_ui.modal.dates_list_header")}
              </Text>
              <Box maxH="200px" overflowY="auto" p={2} border="1px solid" borderColor="gray.100" borderRadius="md">
                <List spacing={2}>
                  {occurrences.map((date, index) => (
                    <ListItem key={index} display="flex" alignItems="center">
                      <ListIcon as={MdCheckCircle} color="green.500" />
                      <Text>{moment(date).format("LL")}</Text>
                      {index === 0 && (
                        <Badge ml={2} colorScheme="purple" variant="subtle">
                          {t("recurring_invoice_ui.modal.next_badge")}
                        </Badge>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
            <Text fontSize="sm">
              {t("recurring_invoice_ui.modal.confirm_proceed_text")}
            </Text>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onClose}>
              {t("recurring_invoice_ui.modal.cancel_button")}
            </Button>
            <Button
              colorScheme="teal"
              isLoading={formik.isSubmitting}
              onClick={() => {
                formik.handleSubmit();
                onClose();
              }}
            >
              {t("recurring_invoice_ui.modal.confirm_button")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
