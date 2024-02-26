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
import { useEffect } from "react";
import useProducts from "../../../hooks/useProducts";
import useProductForm from "../../../hooks/useProductForm";
import ProductFormDrawer from "../../products/ProductFormDrawer";
import { IoSearchOutline } from "react-icons/io5";
export default function SelectProduct({ isOpen, onClose, formik, index }) {
  const { products, fetchProducts } = useProducts();
  const {
    isOpen: isProductFormOpen,
    onOpen: openProductFormDrawer,
    onClose: closeProductFormDrawer,
  } = useDisclosure();
  const { formik: productsFormFormik } = useProductForm(
    fetchProducts,
    closeProductFormDrawer
  );
  useEffect(() => {
    fetchProducts();
  }, []);
  return (
    <Modal
      size={"2xl"}
      scrollBehavior="inside"
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select a product</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex justifyContent={"flex-end"} alignItems={"center"}>
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
        </ModalBody>

        <TableContainer>
          <Table variant="simple">
            <TableCaption>
              <InputGroup margin={"auto"}>
                <InputLeftElement pointerEvents="none">
                  <IoSearchOutline />
                </InputLeftElement>
                <Input type="search" />
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
