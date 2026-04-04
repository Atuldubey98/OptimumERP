import {
  Box,
  Button,
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaFileInvoice, FaFileInvoiceDollar } from "react-icons/fa6";
import { GiExpense } from "react-icons/gi";
import { GoPeople, GoTag } from "react-icons/go";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { IoCartOutline, IoCreateOutline, IoSearchOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import usePartyForm from "../../hooks/usePartyForm";
import useProductForm from "../../hooks/useProductForm";
import PartyFormDrawer from "../parties/PartyFormDrawer";
import ProductFormDrawer from "../products/ProductFormDrawer";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { TiContacts } from "react-icons/ti";
import QuickAccessActionCard from "./QuickAccessActionCard";
export default function QuickAccessModal({ isOpen, onClose }) {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { orgId = localStorage.getItem("organization") } = useParams();
  const quickAccessLabels = [
    {
      label: t("common_ui.quick_access.labels.parties"),
      description: t("common_ui.quick_access.descriptions.parties", {
        defaultValue: "Review your customers, vendors, and business relationships",
      }),
      onClick: () => navigate(`/${orgId}/parties`),
      icon: <GoPeople size={50} />,
    },
    {
      label: t("common_ui.quick_access.labels.create_party"),
      description: t("common_ui.quick_access.descriptions.create_party", {
        defaultValue: "Add a new party and start tracking activity right away",
      }),
      onClick: () => openPartyFormDrawer(),
      icon: <IoCreateOutline size={50} />,
    },
    {
      label: t("common_ui.quick_access.labels.invoices"),
      description: t("common_ui.quick_access.descriptions.invoices", {
        defaultValue: "Browse issued invoices and follow their current status",
      }),
      onClick: () => {
        navigate(`/${orgId}/invoices`);
      },
      icon: <FaFileInvoiceDollar size={50} />,
    },
    {
      label: t("common_ui.quick_access.labels.create_invoice"),
      description: t("common_ui.quick_access.descriptions.create_invoice", {
        defaultValue: "Prepare a fresh invoice for billing in just a few steps",
      }),
      onClick: () => {
        navigate(`/${orgId}/invoices/create`);
      },
      icon: <IoCreateOutline size={50} />,
    },
    {
      label: t("common_ui.quick_access.labels.estimates"),
      description: t("common_ui.quick_access.descriptions.estimates", {
        defaultValue: "Review quotations and keep upcoming deals moving",
      }),
      onClick: () => {
        navigate(`/${orgId}/estimates`);
      },
      icon: <FaFileInvoice size={50} />,
    },
    {
      label: t("common_ui.quick_access.labels.purchase"),
      description: t("common_ui.quick_access.descriptions.purchase", {
        defaultValue: "Track purchase bills and monitor supplier activity",
      }),
      onClick: () => {
        navigate(`/${orgId}/purchases`);
      },
      icon: <FaFileInvoice size={50} />,
    },
    {
      label: t("common_ui.quick_access.labels.create_purchase"),
      description: t("common_ui.quick_access.descriptions.create_purchase", {
        defaultValue: "Record a new purchase and keep expense records current",
      }),
      onClick: () => {
        navigate(`/${orgId}/purchases/create`);
      },
      icon: <IoCreateOutline size={50} />,
    },
    {
      label: t("common_ui.quick_access.labels.create_estimate"),
      description: t("common_ui.quick_access.descriptions.create_estimate", {
        defaultValue: "Draft a new estimate before converting it into a sale",
      }),
      onClick: () => {
        navigate(`/${orgId}/estimates/create`);
      },
      icon: <IoCreateOutline size={50} />,
    },
    {
      label: t("common_ui.quick_access.labels.reports"),
      description: t("common_ui.quick_access.descriptions.reports", {
        defaultValue: "Open reports to inspect performance and export data quickly",
      }),
      onClick: () => {
        navigate(`/${orgId}/reports/sale`);
      },
      icon: <HiOutlineDocumentReport size={50} />,
    },
    {
      label: t("common_ui.quick_access.labels.products"),
      description: t("common_ui.quick_access.descriptions.products", {
        defaultValue: "Manage your catalog, pricing, and sellable items",
      }),
      onClick: () => {
        navigate(`/${orgId}/products`);
      },
      icon: <GoTag size={50} />,
    },
    {
      label: t("common_ui.quick_access.labels.create_product"),
      description: t("common_ui.quick_access.descriptions.create_product", {
        defaultValue: "Add a product to your catalog without leaving the modal",
      }),
      onClick: () => {
        openProductForm();
      },
      icon: <IoCreateOutline size={50} />,
    },
    {
      label: t("common_ui.quick_access.labels.expenses"),
      description: t("common_ui.quick_access.descriptions.expenses", {
        defaultValue: "View expenses and keep operational costs under control",
      }),
      onClick: () => navigate(`/${orgId}/expenses`),
      icon: <GiExpense size={50} />,
    },
    {
      label: t("common_ui.quick_access.labels.proforma_invoices"),
      description: t("common_ui.quick_access.descriptions.proforma_invoices", {
        defaultValue: "Check proforma invoices before they turn into billable sales",
      }),
      onClick: () => {
        navigate(`/${orgId}/proformaInvoices`);
      },
      icon: <LiaFileInvoiceDollarSolid size={50} />,
    },
    {
      label: t("common_ui.quick_access.labels.purchase_orders"),
      description: t("common_ui.quick_access.descriptions.purchase_orders", {
        defaultValue: "Review purchase orders and stay ahead of procurement work",
      }),
      onClick: () => {
        navigate(`/${orgId}/purchaseOrders`);
      },
      icon: <IoCartOutline size={50} />,
    },
    {
      label: t("common_ui.quick_access.labels.create_po"),
      description: t("common_ui.quick_access.descriptions.create_po", {
        defaultValue: "Start a purchase order for upcoming supplier requests",
      }),
      onClick: () => {
        navigate(`/${orgId}/purchaseOrders/create`);
      },
      icon: <IoCreateOutline size={50} />,
    },
    {
      label: t("common_ui.quick_access.labels.create_pro_invoice"),
      description: t("common_ui.quick_access.descriptions.create_pro_invoice", {
        defaultValue: "Create a proforma invoice to share pricing before billing",
      }),
      onClick: () => {
        navigate(`/${orgId}/proformaInvoices/create`);
      },
      icon: <IoCreateOutline size={50} />,
    },
    {
      label: t("common_ui.quick_access.labels.contacts"),
      description: t("common_ui.quick_access.descriptions.contacts", {
        defaultValue: "Access contact records and keep communication details tidy",
      }),
      onClick: () => {
        navigate(`/${orgId}/contacts`);
      },
      icon: <TiContacts size={50} />,
    },
    {
      label: t("common_ui.quick_access.labels.create_contact", {
        defaultValue: "Create contact",
      }),
      description: t("common_ui.quick_access.descriptions.create_contact", {
        defaultValue: "Capture a new contact without leaving your current workflow",
      }),
      onClick: () => {
        navigate(`/${orgId}/contacts?action=create`);
      },
      icon: <IoCreateOutline size={50} />,
    },
  ];
  const [search, setSearch] = useState("");
  const {
    isOpen: isPartyFormOpen,
    onOpen: openPartyFormDrawer,
    onClose: closePartyFormDrawer,
  } = useDisclosure();
  const {
    isOpen: isProductFormOpen,
    onOpen: openProductForm,
    onClose: closeProductForm,
  } = useDisclosure();
  const { formik } = usePartyForm(undefined, closePartyFormDrawer);
  const { formik: productFormik } = useProductForm(undefined, closeProductForm);
  const filteredQuickAccessLabels = quickAccessLabels.filter(
    (quickAccess) =>
      quickAccess.label.toLowerCase().includes(search.toLowerCase()) || !search
  );

  return (
    <Modal
      scrollBehavior="inside"
      blockScrollOnMount={false}
      size={"2xl"}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay bg="blackAlpha.400" />
      <ModalContent borderRadius="2xl" overflow="hidden">
        <ModalHeader>
          <Stack spacing={4}>
            <Box>
              <Text fontSize="xl" fontWeight="semibold">
                {t("common_ui.quick_access.title")}
              </Text>
              <Text fontSize="sm" color="gray.500" mt={1}>
                {t("common_ui.search.placeholder")}
              </Text>
            </Box>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <IoSearchOutline color="currentColor" />
              </InputLeftElement>
              <Input
                value={search}
                autoFocus
                onChange={(e) => setSearch(e.currentTarget.value)}
                type="search"
                placeholder={t("common_ui.search.placeholder")}
              />
            </InputGroup>
          </Stack>
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Stack spacing={4} py={1}>
            <Text fontSize="sm" color="gray.500">
              {t("common_ui.quick_access.result_count", {
                count: filteredQuickAccessLabels.length,
                defaultValue:
                  filteredQuickAccessLabels.length === 1
                    ? "1 shortcut available"
                    : `${filteredQuickAccessLabels.length} shortcuts available`,
              })}
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              {filteredQuickAccessLabels.map((quickAccess) => (
                <QuickAccessActionCard
                  key={quickAccess.label}
                  icon={quickAccess.icon}
                  label={quickAccess.label}
                  description={quickAccess.description}
                  onClick={quickAccess.onClick}
                />
              ))}
            </SimpleGrid>
            {filteredQuickAccessLabels.length ? null : (
              <Box py={10} textAlign="center">
                <Text color="gray.500">
                  {t("common_ui.tables.nothing_to_show", {
                    defaultValue: "Nothing to show",
                  })}
                </Text>
              </Box>
            )}
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            {t("common_ui.actions.close")}
          </Button>
        </ModalFooter>
      </ModalContent>
      <PartyFormDrawer
        formik={formik}
        isOpen={isPartyFormOpen}
        onClose={closePartyFormDrawer}
      />
      <ProductFormDrawer
        formik={productFormik}
        isOpen={isProductFormOpen}
        onClose={closeProductForm}
      />
    </Modal>
  );
}
