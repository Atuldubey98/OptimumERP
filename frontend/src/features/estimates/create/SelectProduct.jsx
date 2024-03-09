import {
  Button,
  ButtonGroup,
  Checkbox,
  Flex,
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
  Thead,
  Tr,
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
export default function SelectProduct({ isOpen, onClose, formik, index }) {
  const [currentPage, setCurrentPage] = useState(1);

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
  const controller = new AbortController();
  const fetchProducts = useCallback(async () => {
    const { data } = await instance.get(
      `/api/v1/organizations/${orgId}/products`,
      {
        signal: controller.signal,
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
  }, [deboucedSearch, currentPage]);
  const { formik: productsFormFormik } = useProductForm(
    fetchProducts,
    closeProductFormDrawer
  );

  useEffect(() => {
    fetchProducts();
    return () => {
      controller.abort();
    };
  }, [deboucedSearch, currentPage]);
  const { items: products, page, totalPages, total } = response;
  return (
    <Modal size={"2xl"} isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select a product</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex justifyContent={"space-around"} alignItems={"center"}>
            <PaginateButtons
              nextPage={() => setCurrentPage((curr) => curr + 1)}
              previousPage={() => setCurrentPage((curr) => curr - 1)}
              page={page}
              totalPages={totalPages}
            />
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
