import {
  Button,
  Card,
  CardBody,
  Flex,
  Grid,
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
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useState } from "react";
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
export default function QuickAccessModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { orgId = localStorage.getItem("organization") } = useParams();
  const quickAccessLabels = [
    {
      label: "Parties",
      onClick: () => navigate(`/${orgId}/parties`),
      icon: <GoPeople size={50} />,
    },
    {
      label: "Create Party",
      onClick: () => openPartyFormDrawer(),
      icon: <IoCreateOutline size={50} />,
    },
    {
      label: "Invoices",
      onClick: () => {
        navigate(`/${orgId}/invoices`);
      },
      icon: <FaFileInvoiceDollar size={50} />,
    },
    {
      label: "Create Invoice",
      onClick: () => {
        navigate(`/${orgId}/invoices/create`);
      },
      icon: <IoCreateOutline size={50} />,
    },
    {
      label: "Estimates",
      onClick: () => {
        navigate(`/${orgId}/estimates`);
      },
      icon: <FaFileInvoice size={50} />,
    },
    {
      label: "Purchase",
      onClick: () => {
        navigate(`/${orgId}/purchases`);
      },
      icon: <FaFileInvoice size={50} />,
    },
    {
      label: "Create Purchase",
      onClick: () => {
        navigate(`/${orgId}/purchases/create`);
      },
      icon: <IoCreateOutline size={50} />,
    },
    {
      label: "Create Estimate",
      onClick: () => {
        navigate(`/${orgId}/estimates/create`);
      },
      icon: <IoCreateOutline size={50} />,
    },
    {
      label: "Reports",
      onClick: () => {
        navigate(`/${orgId}/reports/sale`);
      },
      icon: <HiOutlineDocumentReport size={50} />,
    },
    {
      label: "Products",
      onClick: () => {
        navigate(`/${orgId}/products`);
      },
      icon: <GoTag size={50} />,
    },
    {
      label: "Create Product",
      onClick: () => {
        openProductForm();
      },
      icon: <IoCreateOutline size={50} />,
    },
    {
      label: "Expenses",
      onClick: () => navigate(`/${orgId}/expenses`),
      icon: <GiExpense size={50} />,
    },
    {
      label: "Proforma Invoices",
      onClick: () => {
        navigate(`/${orgId}/proformaInvoices`);
      },
      icon: <LiaFileInvoiceDollarSolid size={50} />,
    },
    {
      label: "Purchase Orders",
      onClick: () => {
        navigate(`/${orgId}/purchaseOrders`);
      },
      icon: <IoCartOutline size={50} />,
    },
    {
      label: "Create PO",
      onClick: () => {
        navigate(`/${orgId}/purchaseOrders/create`);
      },
      icon: <IoCreateOutline size={50} />,
    },
    {
      label: "Create Pro Invoice",
      onClick: () => {
        navigate(`/${orgId}/proformaInvoices/create`);
      },
      icon: <IoCreateOutline size={50} />,
    },
    {
      label: "Contacts",
      onClick: () => {
        navigate(`/${orgId}/contacts`);
      },
      icon: <TiContacts size={50} />,
    },
  ];
  const [search, setSearch] = useState("");
  const hoverBg = useColorModeValue("gray.200", "gray.600");
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
  return (
    <Modal
      scrollBehavior="inside"
      blockScrollOnMount={false}
      size={"2xl"}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Stack spacing={3}>
            <Text>Quick Access</Text>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <IoSearchOutline color="blue.300" />
              </InputLeftElement>
              <Input
                value={search}
                autoFocus
                onChange={(e) => setSearch(e.currentTarget.value)}
                type="search"
                placeholder="Search"
              />
            </InputGroup>
          </Stack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex justifyContent={"center"} width={"100%"} alignItems={"center"}>
            <Grid
              templateColumns={{
                sm: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              }}
              gap={2}
            >
              {quickAccessLabels
                .filter(
                  (quickAccess) =>
                    quickAccess.label
                      .toLowerCase()
                      .includes(search.toLowerCase()) || !search
                )
                .map((quickAccess) => (
                  <Card
                    onClick={quickAccess.onClick}
                    _hover={{
                      bg: hoverBg,
                    }}
                    w={"100%"}
                    cursor={"pointer"}
                    key={quickAccess.label}
                  >
                    <CardBody>
                      <Flex justifyContent={"center"} alignItems={"center"}>
                        {quickAccess.icon}
                      </Flex>
                      <Stack maxH={450} overflowY={"auto"} mt="6" spacing="3">
                        <Text textAlign={"center"} size="md">
                          {quickAccess.label}
                        </Text>
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
            </Grid>
          </Flex>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
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
