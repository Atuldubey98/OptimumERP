import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  Image,
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
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { AiOutlineCustomerService } from "react-icons/ai";
import { FaFileInvoice, FaFileInvoiceDollar } from "react-icons/fa6";
import { IoSearchOutline } from "react-icons/io5";
import { IoCreateOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { GoTag } from "react-icons/go";
import PartyFormDrawer from "../parties/PartyFormDrawer";
import usePartyForm from "../../hooks/usePartyForm";
import useProductForm from "../../hooks/useProductForm";
import ProductFormDrawer from "../products/ProductFormDrawer";
import { GiExpense } from "react-icons/gi";
export default function QuickAccessModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const quickAccessLabels = [
    {
      label: "Parties",
      onClick: () => navigate(`/${orgId}/parties`),
      icon: <AiOutlineCustomerService size={50} />,
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
      onClick: () => openProductForm(),
      icon: <IoCreateOutline size={50} />,
    },
    {
      label: "Expenses",
      onClick: () => navigate(`/${orgId}/expenses`),
      icon: <GiExpense size={50} />,
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
    <Modal size={"2xl"} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Quick Access</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <IoSearchOutline color="blue.300" />
            </InputLeftElement>
            <Input
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              type="search"
              placeholder="Search"
            />
          </InputGroup>
          <Flex
            marginBlock={4}
            justifyContent={"center"}
            alignItems={"center"}
            flexWrap={"wrap"}
            gap={2}
          >
            {quickAccessLabels
              .filter(
                (quickAccess) =>
                  quickAccess.label.toLowerCase().includes(search.toLowerCase()) || !search
              )
              .map((quickAccess) => (
                <Card
                  onClick={quickAccess.onClick}
                  _hover={{
                    bg: hoverBg,
                  }}
                  cursor={"pointer"}
                  key={quickAccess.label}
                  minW={200}
                  maxW={200}
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
