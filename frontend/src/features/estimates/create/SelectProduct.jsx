import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Flex,
  Heading,
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
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Tfoot,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import useDebouncedInput from "../../../hooks/useDeboucedInput";
import useProductForm from "../../../hooks/useProductForm";
import ProductFormDrawer from "../../products/ProductFormDrawer";
import instance from "../../../instance";
import { useParams } from "react-router-dom";
import PaginateButtons from "../../common/PaginateButtons";
import { MdOutlineInventory2 } from "react-icons/md";
export default function SelectProduct({ isOpen, onClose, formik, index }) {
  const [currentPage, setCurrentPage] = useState(1);
  const bg = useColorModeValue("gray.100", "gray.800");

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
    }
  }, [deboucedSearch, currentPage]);
  const { formik: productsFormFormik } = useProductForm(
    fetchProducts,
    closeProductFormDrawer
  );

  useEffect(() => {
    fetchProducts();
  }, [deboucedSearch, currentPage]);
  const { items: products, page, totalPages } = response;
  return (
    <Modal size={"2xl"} isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select a product</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex justifyContent={"space-between"} alignItems={"center"}>
            {totalPages ? (
              <PaginateButtons
                nextPage={() => setCurrentPage((curr) => curr + 1)}
                previousPage={() => setCurrentPage((curr) => curr - 1)}
                page={page}
                totalPages={totalPages}
              />
            ) : null}
            <ButtonGroup>
              <Button
                onClick={() => {
                  formik.setFieldValue(`items[${index}]`, {
                    name: "",
                    quantity: 1,
                    um: "none",
                    gst: "none",
                    price: 0,
                  });
                  onClose();
                }}
                variant={"outline"}
              >
                Clear
              </Button>
              <Button
                onClick={openProductFormDrawer}
                variant={"solid"}
                colorScheme="blue"
              >
                Add
              </Button>
            </ButtonGroup>
          </Flex>
          {products.length ? (
            <TableContainer>
              <Table variant="simple">
                <TableCaption>
                  <InputGroup margin={"auto"}>
                    <InputLeftElement pointerEvents="none">
                      <IoSearchOutline />
                    </InputLeftElement>
                    <Input
                      type="search"
                      onChange={onChangeInput}
                      value={search}
                    />
                  </InputGroup>
                </TableCaption>
                <Thead>
                  <Tr>
                    <Th>#</Th>
                    <Th>Name</Th>
                    <Th>Price</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {products.map((product) => (
                    <Tr key={product.name}>
                      <Td>
                        <Checkbox
                          isChecked={
                            product.name === formik.values.items[index].name
                          }
                          onChange={() => {
                            formik.setFieldValue(`items[${index}]`, {
                              name: product.name,
                              quantity: 1,
                              um: product.um || "none",
                              code: product.code || "",
                              gst: "none",
                              price: product.sellingPrice || 0,
                            });
                            onClose();
                          }}
                        />
                      </Td>
                      <Td>{product.name}</Td>
                      <Td>{product.sellingPrice}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Flex
              gap={3}
              justifyContent={"center"}
              alignItems={"center"}
              flexDir={"column"}
            >
              <Box p={5} borderRadius={"full"} bg={bg}>
                <MdOutlineInventory2 size={70} />
              </Box>
              <Heading fontSize={"xl"}>No products found !</Heading>
            </Flex>
          )}
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
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
