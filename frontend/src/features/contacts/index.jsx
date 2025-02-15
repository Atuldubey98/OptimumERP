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
import React, { useState } from "react";
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
import { contactTypes } from "../../constants/contactTypes";
import useQuery from "../../hooks/useQuery";
const contactDto = Yup.object({
  name: Yup.string().label("Name").required().min(2).max(40),
  email: Yup.string().email().max(40).optional(),
  party: Yup.string().optional(),
  telephone: Yup.string().required(),
  description: Yup.string().optional().max(80),
  type: Yup.string().required(),
});
export default function ContactsPage() {
  const { orgId } = useParams();
  const query = useQuery();
  const type = query.get("type") || "";
  const { data, fetchFn, status } = usePaginatedFetch({
    url: `/api/v1/organizations/${orgId}/contacts`,
  });
  const loading = status === "loading";
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
        title: "Success",
        description: _id ? "Contact updated" : "Contact created",
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
        title: "Success",
        description: "Contact deleted",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      fetchFn();
      closeContactDeleteModal();
    } catch (error) {
      toast({
        title: "Error",
        description: isAxiosError(error)
          ? error.response?.data.message
          : "Error occured",
        status: _id ? "info" : "success",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeleting(false);
    }
  };
  const navigate = useNavigate();
  const allContactTypes = [
    {
      value: "",
      label: "All",
      description: "All contacts",
    },
    ...contactTypes,
  ];
  return (
    <MainLayout>
      <Box p={4}>
        <HeadingButtons
          isAddDisabled={data.reachedLimit}
          heading={"Contacts"}
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
                <SearchItem placeholder="Search Contacts" />
              </Box>
              <FilterPopoverWrapper>
                <FormControl>
                  <FormLabel>Contact type</FormLabel>
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
                      item={item}
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
                    No Contacts
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
        handleFormSubmit={formik.handleSubmit}
      />
      <AlertModal
        confirmDisable={deleting}
        body={"Do you want to delete the contact ?"}
        header={"Delete contact"}
        isOpen={isContacDeleteModalOpen}
        onClose={closeContactDeleteModal}
        onConfirm={deleteContact}
      />
    </MainLayout>
  );
}
