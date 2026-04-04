import {
  Box,
  Card,
  CardBody,
  Flex,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { LuUsers } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import useParties from "../../hooks/useParties";
import usePartyForm from "../../hooks/usePartyForm";
import useQuery from "../../hooks/useQuery";
import instance from "../../instance";
import AlertModal from "../common/AlertModal";
import MainLayout from "../common/main-layout";
import Pagination from "../common/main-layout/Pagination";
import HeadingButtons from "../common/table-layout/HeadingButtons";
import SearchItem from "../common/table-layout/SearchItem";
import PartyFormDrawer from "./PartyFormDrawer";
import PartyCard from "./PartyCard";
import PartyMenu from "./PartyMenu";
import DisplayPartyDrawer from "./PartyDisplayDrawer";


export default function PartysPage() {
  const { t } = useTranslation("party");
  const subtleTextColor = useColorModeValue("gray.600", "gray.300");
  const query = useQuery();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure();
  const {
    isOpen: isPartyFormOpen,
    onClose: onClosePartyFormDrawer,
    onOpen: openPartyFormDrawer,
  } = useDisclosure();
  const {
    isOpen: isPartyDrawerOpen,
    onClose: closePartyDrawer,
    onOpen: openPartyDrawer,
  } = useDisclosure();
  const {
    parties,
    fetchPartys,
    loading,
    currentPage,
    reachedLimit,
    totalPartys,
    totalPages,
  } = useParties();
  const { formik: partyFormik } = usePartyForm(
    fetchPartys,
    onClosePartyFormDrawer
  );
  const [selectedToShowParty, setSelectedToShowParty] = useState(null);
  const onOpenParty = (party) => {
    setSelectedToShowParty(party);
    openPartyDrawer();
  };
  const { orgId = "" } = useParams();
  const [status, setStatus] = useState("idle");
  const deleting = status === "deleting";
  const onOpenPartyToDelete = (party) => {
    setSelectedToShowParty(party);
    openDeleteModal();
  };
  const toast = useToast();
  const onDeleteParty = async () => {
    try {
      setStatus("deleting");
      await instance.delete(
        `/api/v1/organizations/${orgId}/parties/${selectedToShowParty._id}`
      );
      fetchPartys();
      setStatus("idle");
    } catch (err) {
      toast({
        title: isAxiosError(err) ? err.response?.data?.name : "Error",
        description: isAxiosError(err)
          ? err?.response?.data.message || "Network error occured"
          : "Network error occured",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setStatus("idle");
      closeDeleteModal();
    }
  };
  const onCloseParty = () => {
    closePartyDrawer();
    setSelectedToShowParty(null);
  };
  const onOpenDrawerForAddingNewParty = () => {
    partyFormik.setValues({
      name: "",
      billingAddress: "",
      gstNo: "",
      panNo: "",
      shippingAddress: "",
    });
    openPartyFormDrawer();
  };
  const onOpenDrawerForEditingParty = (party) => {
    partyFormik.setValues(party);
    openPartyFormDrawer();
  };
  const navigate = useNavigate();
  const searchQuery = query.get("query") || "";

  return (
    <MainLayout>
      <Box px={{ base: 3, md: 4 }} py={{ base: 3, md: 4 }}>
        {loading ? (
          <Flex justifyContent={"center"} alignItems={"center"} minH="40svh">
            <Spinner size={"md"} />
          </Flex>
        ) : (
          <Stack spacing={{ base: 5, md: 6 }}>
            <HeadingButtons
              isAddDisabled={reachedLimit}
              heading={t("party_ui.page.heading")}
              onAddNewItem={onOpenDrawerForAddingNewParty}
            />

            <Card borderRadius="2xl">
              <CardBody>
                <Stack spacing={5}>
                  <Box maxW="md">
                    <SearchItem />
                  </Box>
                  <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
                    <Card borderRadius="xl">
                      <CardBody py={4}>
                        <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="gray.500">
                          {t("party_ui.page.total_label", { defaultValue: "Total records" })}
                        </Text>
                        <Heading mt={2} fontSize="2xl">
                          {totalPartys || 0}
                        </Heading>
                      </CardBody>
                    </Card>
                    <Card borderRadius="xl">
                      <CardBody py={4}>
                        <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="gray.500">
                          {t("common_ui.table.current_page", { defaultValue: "Page" })}
                        </Text>
                        <Heading mt={2} fontSize="2xl">
                          {currentPage || 1}
                        </Heading>
                      </CardBody>
                    </Card>
                    <Card borderRadius="xl">
                      <CardBody py={4}>
                        <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color="gray.500">
                          {t("common_ui.actions.search", { defaultValue: "Search" })}
                        </Text>
                        <Text mt={2} fontWeight="semibold" noOfLines={1}>
                          {searchQuery || "All parties"}
                        </Text>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </Stack>
              </CardBody>
            </Card>

            <Stack spacing={4}>
              <Text color={subtleTextColor} fontSize="sm">
                {`${totalPartys || 0} ${t("party_ui.page.total_found", {
                  defaultValue: "parties found",
                })}`}
              </Text>

              {parties.length ? (
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
                  {parties.map((party) => (
                    <PartyCard
                      key={party._id}
                      party={party}
                      actions={
                        <PartyMenu
                          onOpenTransactionsForParty={() => {
                            navigate(`/${orgId}/parties/${party._id}/transactions`);
                          }}
                          onDeleteParty={onOpenPartyToDelete}
                          party={party}
                          onOpenDrawerForEditingParty={onOpenDrawerForEditingParty}
                          onOpenParty={onOpenParty}
                        />
                      }
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Flex minH="36svh" justify="center" align="center">
                  <Card borderRadius="2xl" maxW="lg" w="100%">
                    <CardBody>
                      <Stack spacing={4} align="center" textAlign="center" py={8}>
                        <LuUsers size={72} color="lightgray" />
                        <Heading color="gray.400" fontSize="2xl">
                          {t("party_ui.page.no_parties", {
                            defaultValue: "No parties found",
                          })}
                        </Heading>
                        <Text color={subtleTextColor} maxW="md">
                          {t("party_ui.page.empty_state", {
                            defaultValue:
                              "Create your first party or adjust your search to see matching records here.",
                          })}
                        </Text>
                      </Stack>
                    </CardBody>
                  </Card>
                </Flex>
              )}
            </Stack>
          </Stack>
        )}
        <AlertModal
          confirmDisable={deleting}
          body={t("party_ui.modal.delete_body")}
          header={t("party_ui.modal.delete_header")}
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={onDeleteParty}
        />
        <PartyFormDrawer
          formik={partyFormik}
          isOpen={isPartyFormOpen}
          onClose={onClosePartyFormDrawer}
        />
        {selectedToShowParty ? (
          <DisplayPartyDrawer
            isPartyDrawerOpen={isPartyDrawerOpen}
            reachedLimit={reachedLimit}
            selectedToShowParty={selectedToShowParty}
            onCloseParty={onCloseParty}
            onOpenDrawerForAddingNewParty={onOpenDrawerForAddingNewParty}
          />
        ) : null}
        {loading ? null : (
          <Pagination currentPage={currentPage} total={totalPages} />
        )}
      </Box>
    </MainLayout>
  );
}
