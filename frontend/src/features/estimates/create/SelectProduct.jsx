import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  HStack,
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
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import useDebouncedInput from "../../../hooks/useDeboucedInput";
import useProductForm from "../../../hooks/useProductForm";
import ProductFormDrawer from "../../products/ProductFormDrawer";
import instance from "../../../instance";
import { useParams } from "react-router-dom";
import PaginateButtons from "../../common/PaginateButtons";
import { MdOutlineInventory2 } from "react-icons/md";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
export default function SelectProduct({ isOpen, onClose, formik, index }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState();
  const [loading, setLoading] = useState(false);
  const { getDefaultReceiptItem, getAmountWithSymbol } = useCurrentOrgCurrency();
  const defaultItem = getDefaultReceiptItem();
  const emptyStateBg = useColorModeValue("gray.100", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const selectedCardBg = useColorModeValue("blue.50", "blue.900");
  const selectedCardBorder = useColorModeValue("blue.400", "blue.300");
  const mutedTextColor = useColorModeValue("gray.500", "gray.400");
  const helperBg = useColorModeValue("gray.50", "whiteAlpha.100");

  const [response, setResponse] = useState({
    items: [],
    totalPages: 0,
    total: 0,
    page: 0,
  });
  const {
    input: search,
    deboucedInput: deboucedSearch,
    onChangeInput,
  } = useDebouncedInput(() => {
    setCurrentPage(1);
  });
  const {
    isOpen: isProductFormOpen,
    onOpen: openProductFormDrawer,
    onClose: closeProductFormDrawer,
  } = useDisclosure();
  const { orgId } = useParams();
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/products`,
        {
          params: {
            page: currentPage,
            search: deboucedSearch,
          },
        }
      );
      setResponse({
        items: data.data,
        total: data.total,
        totalPages: data.totalPages,
        page: data.page,
      });
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [deboucedSearch, currentPage, orgId]);
  const { formik: productsFormFormik } = useProductForm(
    fetchProducts,
    closeProductFormDrawer
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  const { items: products, page, totalPages } = response;

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const selectedProduct = products.find(
      (product) => product.name === formik.values.items[index].name
    );
    setSelectedProductId(selectedProduct?._id);
  }, [formik.values.items, index, isOpen, products]);

  const selectedProduct = useMemo(
    () => products.find((product) => product._id === selectedProductId),
    [products, selectedProductId],
  );

  const applyProductSelection = useCallback(
    (product) => {
      if (!product) {
        return;
      }
      formik.setFieldValue(`items[${index}]`, {
        name: product.name,
        quantity: formik.values.items[index].quantity || 1,
        um: product.um?._id || defaultItem.um,
        code: product.code,
        tax: defaultItem.tax,
        price: product.sellingPrice || 0,
      });
      onClose();
    },
    [defaultItem.tax, defaultItem.um, formik, index, onClose],
  );

  return (
    <Modal size={{ base: "full", md: "4xl" }} isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader pb={2}>
          <Stack spacing={1}>
            <Heading fontSize={{ base: "xl", md: "2xl" }}>Select a product</Heading>
            <Text fontSize="sm" fontWeight="normal" color={mutedTextColor}>
              Choose a saved product to fill the item name, code, unit, and selling price.
            </Text>
          </Stack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={5}>
            <Box
              bg={helperBg}
              borderWidth="1px"
              borderColor={cardBorder}
              borderRadius="xl"
              p={{ base: 4, md: 5 }}
            >
              <Flex
                align={{ base: "stretch", lg: "center" }}
                direction={{ base: "column", lg: "row" }}
                gap={4}
                justify="space-between"
              >
                <Stack spacing={3} flex={1}>
                  <Box>
                    <Text fontSize="sm" color={mutedTextColor}>
                      Selecting for
                    </Text>
                    <Heading fontSize={{ base: "lg", md: "xl" }}>
                      Product {index + 1}
                    </Heading>
                  </Box>
                  <InputGroup maxW={{ lg: "420px" }}>
                    <InputLeftElement pointerEvents="none">
                      <IoSearchOutline />
                    </InputLeftElement>
                    <Input
                      type="search"
                      onChange={onChangeInput}
                      value={search}
                      placeholder="Search by product name"
                    />
                  </InputGroup>
                </Stack>
                <ButtonGroup flexWrap="wrap" justifyContent="flex-end">
                  <Button
                    onClick={() => {
                      setSelectedProductId(undefined);
                      formik.setFieldValue(`items[${index}]`, defaultItem);
                      onClose();
                    }}
                    variant={"outline"}
                  >
                    Clear item
                  </Button>
                  <Button
                    onClick={openProductFormDrawer}
                    variant={"solid"}
                    colorScheme="blue"
                  >
                    Add product
                  </Button>
                </ButtonGroup>
              </Flex>
            </Box>

            <Flex
              justifyContent="space-between"
              align={{ base: "stretch", md: "center" }}
              direction={{ base: "column", md: "row" }}
              gap={3}
            >
              <HStack spacing={3} color={mutedTextColor}>
                <Text fontSize="sm">
                  {response.total || products.length} product{(response.total || products.length) === 1 ? "" : "s"}
                </Text>
                {selectedProduct ? (
                  <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                    Selected: {selectedProduct.name}
                  </Badge>
                ) : null}
              </HStack>
              {totalPages ? (
                <PaginateButtons
                  nextPage={() => setCurrentPage((curr) => curr + 1)}
                  previousPage={() => setCurrentPage((curr) => curr - 1)}
                  page={page}
                  totalPages={totalPages}
                />
              ) : null}
            </Flex>

            {loading ? (
              <Flex alignItems="center" justifyContent="center" minH="260px">
                <Spinner />
              </Flex>
            ) : products.length ? (
              <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
                {products.map((product) => {
                  const isSelected = product._id === selectedProductId;

                  return (
                    <Box
                      key={product._id}
                      bg={isSelected ? selectedCardBg : cardBg}
                      borderWidth="1px"
                      borderColor={isSelected ? selectedCardBorder : cardBorder}
                      borderRadius="xl"
                      boxShadow={isSelected ? "md" : "sm"}
                      cursor="pointer"
                      p={4}
                      transition="0.2s ease"
                      onClick={() => setSelectedProductId(product._id)}
                    >
                      <Stack spacing={4}>
                        <Flex justify="space-between" gap={3} align="flex-start">
                          <Stack spacing={1}>
                            <Heading fontSize="lg" noOfLines={2} maxW="full">
                              {product.name}
                            </Heading>
                            <Text fontSize="sm" color={mutedTextColor}>
                              {product.code || "No HSN/SAC code"}
                            </Text>
                          </Stack>
                          {isSelected ? (
                            <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                              Selected
                            </Badge>
                          ) : null}
                        </Flex>

                        <SimpleGrid columns={2} spacing={3}>
                          <Box>
                            <Text fontSize="xs" textTransform="uppercase" color={mutedTextColor}>
                              Price
                            </Text>
                            <Text fontWeight="semibold">
                              {getAmountWithSymbol(product.sellingPrice || 0)}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="xs" textTransform="uppercase" color={mutedTextColor}>
                              Unit
                            </Text>
                            <Text fontWeight="semibold">{product.um?.name || "None"}</Text>
                          </Box>
                        </SimpleGrid>

                        <Button
                          colorScheme={isSelected ? "blue" : "gray"}
                          variant={isSelected ? "solid" : "outline"}
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedProductId(product._id);
                          }}
                        >
                          {isSelected ? "Selected" : "Select product"}
                        </Button>
                      </Stack>
                    </Box>
                  );
                })}
              </SimpleGrid>
            ) : (
              <Flex
                gap={3}
                justifyContent={"center"}
                alignItems={"center"}
                flexDir={"column"}
                minH="260px"
              >
                <Box p={5} borderRadius={"full"} bg={emptyStateBg}>
                  <MdOutlineInventory2 size={70} />
                </Box>
                <Heading fontSize={"xl"}>No products found</Heading>
                <Text color={mutedTextColor} textAlign="center" maxW="md">
                  Try a different search term or add a new product to use it in this bill.
                </Text>
              </Flex>
            )}
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={() => applyProductSelection(selectedProduct)}
            isDisabled={!selectedProduct}
          >
            Use selected product
          </Button>
        </ModalFooter>
      </ModalContent>
      <ProductFormDrawer
        formik={productsFormFormik}
        isOpen={isProductFormOpen}
        onClose={closeProductFormDrawer}
      />
    </Modal>
  );
}
