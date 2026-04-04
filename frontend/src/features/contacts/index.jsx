import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Spinner,
  Stack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { isAxiosError } from "axios";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuContact2 } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import useAsyncCall from "../../hooks/useAsyncCall";
import usePaginatedFetch from "../../hooks/usePaginatedFetch";
import instance from "../../instance";
import AlertModal from "../common/AlertModal";
import MainLayout from "../common/main-layout";
import Pagination from "../common/main-layout/Pagination";
import HeadingButtons from "../common/table-layout/HeadingButtons";
import SearchItem from "../common/table-layout/SearchItem";
import Contact from "./Contact";
import ContactForm from "./ContactForm";
import FilterPopoverWrapper from "../common/FilterPopoverWrapper";
import { Select } from "chakra-react-select";
import useQuery from "../../hooks/useQuery";
import useProperty from "../../hooks/useProperty";

export default function ContactsPage() {
  const { t } = useTranslation("contact");
  const { orgId } = useParams();
  const query = useQuery();
  const type = query.get("type") || "";
  const action = query.get("action") || "";
  const { status: propertyStatus, value: contactTypes = [] } =
    useProperty("CONTACT_TYPES");
  const { data, fetchFn, status } = usePaginatedFetch({
    url: `/api/v1/organizations/${orgId}/contacts`,
  });
  const loading = status === "loading" || propertyStatus === "loading";
  const {
    isOpen: isContactFormOpen,
    onOpen: openContactForm,
    onClose: closeContactForm,
  } = useDisclosure();
  const {
    isOpen: isContacDeleteModalOpen,
    onOpen: openContactDeleteModal,
    onClose: closeContactDeleteModal,
  } = useDisclosure();
  const defaultContact = {
    name: "",
    email: "",
    party: "",
    telephone: "",
    description: "",
    type: "unknown",
  };
  const toast = useToast();
  const { requestAsyncHandler } = useAsyncCall();
  const contactDto = Yup.object({
    name: Yup.string()
      .label(t("contact_ui.form.name"))
      .required()
      .min(2)
      .max(40),
    email: Yup.string().email().max(40).optional(),
    party: Yup.string().optional(),
    telephone: Yup.string().required(),
    description: Yup.string().optional().max(80),
    type: Yup.string().required(),
  });

  const formik = useFormik({
    initialValues: defaultContact,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const {
        _id,
        updatedBy,
        partyDetails,
        billingAddress,
        org,
        createdAt,
        updatedAt,
        ...restContact
      } = values;
      await instance[values._id ? "patch" : "post"](
        `/api/v1/organizations/${orgId}/contacts${_id ? `/${_id}` : ""}`,
        { ...restContact, party: restContact.party || null }
      );
      toast({
        title: t("contact_ui.toasts.success"),
        description: _id
          ? t("contact_ui.toasts.updated")
          : t("contact_ui.toasts.created"),
        status: _id ? "info" : "success",
        duration: 3000,
        isClosable: true,
      });
      setSubmitting(false);
      closeContactForm();
      fetchFn();
    }),
    validationSchema: contactDto,
  });
  const [selectedContact, setSelectedContact] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const deleteContact = async () => {
    try {
      setDeleting(true);
      await instance.delete(
        `/api/v1/organizations/${orgId}/contacts/${selectedContact._id}`
      );
      toast({
        title: t("contact_ui.toasts.success"),
        description: t("contact_ui.toasts.deleted"),
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      fetchFn();
      closeContactDeleteModal();
    } catch (error) {
      toast({
        title: t("contact_ui.toasts.error"),
        description: isAxiosError(error)
          ? error.response?.data.message
          : t("contact_ui.toasts.error_occurred"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeleting(false);
    }
  };
  const navigate = useNavigate();
  useEffect(() => {
    if (action !== "create") return;

    formik.resetForm({ values: defaultContact });
    openContactForm();

    const nextQuery = new URLSearchParams(query.toString());
    nextQuery.delete("action");
    const nextSearch = nextQuery.toString();
    navigate(
      {
        pathname: `/${orgId}/contacts`,
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true }
    );
  }, [action, formik, navigate, openContactForm, orgId, query]);

  const allContactTypes = [
    {
      value: "",
      label: t("contact_ui.filters.all"),
      description: t("contact_ui.filters.all_contacts"),
    },
    ...contactTypes,
  ];
  const mapContactTypes = contactTypes.reduce((acc, contactType) => {
    acc[contactType.value] = contactType;
    return acc;
  }, {});  
  return (
    <MainLayout>
      <Box p={4}>
        <HeadingButtons
          isAddDisabled={data.reachedLimit}
          heading={t("contact_ui.page.heading")}
          onAddNewItem={() => {
            formik.resetForm(defaultContact);
            openContactForm();
          }}
        />
        {loading ? (
          <Flex justifyContent={"center"} alignItems={"center"}>
            <Spinner />
          </Flex>
        ) : (
          <Stack spacing={3} marginBlock={3}>
            <Flex justifyContent={"flex-start"} gap={2} alignItems={"center"}>
              <Box maxW={"md"} flex={1}>
                <SearchItem placeholder={t("contact_ui.page.search_contacts")} />
              </Box>
              <FilterPopoverWrapper>
                <FormControl>
                  <FormLabel>{t("contact_ui.page.contact_type")}</FormLabel>
                  <Select
                    options={allContactTypes}
                    onChange={({ value }) => navigate(`?type=${value}`)}
                    value={allContactTypes.find(
                      (contactType) => contactType.value === type
                    )}
                  />
                </FormControl>
              </FilterPopoverWrapper>
            </Flex>
            <Box maxW={"container.xxl"}>
              {data.items.length ? (
                <Grid
                  templateColumns={{
                    sm: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  }}
                  gap={8}
                >
                  {data.items.map((item) => (
                    <Contact
                      key={item._id}
                      item={{
                        ...item,
                        type:
                          mapContactTypes[item.type]?.label ||
                          t("contact_ui.card.unknown"),
                      }}
                      onDeleteContact={() => {
                        setSelectedContact(item);
                        openContactDeleteModal();
                      }}
                      onEditContact={() => {
                        formik.setValues(item);
                        openContactForm();
                        if (item.party) {
                          formik.setFieldValue("party", item.party._id);
                          formik.setFieldValue(
                            "billingAddress",
                            item.party.billingAddress
                          );
                          formik.setFieldValue("partyDetails", item.party);
                        } else {
                          formik.setFieldValue("party", "");
                        }
                      }}
                    />
                  ))}
                </Grid>
              ) : (
                <Flex
                  minH={"50svh"}
                  gap={8}
                  justifyContent={"center"}
                  alignItems={"center"}
                  flexDir={"column"}
                >
                  <LuContact2 size={80} color="lightgray" />
                  <Heading color={"gray.300"} fontSize={"2xl"}>
                    {t("contact_ui.page.no_contacts")}
                  </Heading>
                </Flex>
              )}
            </Box>
            <Pagination
              currentPage={data.currentPage}
              total={data.totalPages}
            />
          </Stack>
        )}
      </Box>
      <ContactForm
        formik={formik}
        isSubmitting={formik.isSubmitting}
        isOpen={isContactFormOpen}
        onClose={closeContactForm}
        contactTypes={contactTypes}
        handleFormSubmit={formik.handleSubmit}
      />
      <AlertModal
        confirmDisable={deleting}
        body={t("contact_ui.delete.body")}
        header={t("contact_ui.delete.header")}
        isOpen={isContacDeleteModalOpen}
        onClose={closeContactDeleteModal}
        onConfirm={deleteContact}
      />
    </MainLayout>
  );
}
