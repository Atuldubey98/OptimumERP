import {
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
  Skeleton,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import PaginateButtons from "../../common/PaginateButtons";
import CustomerFormDrawer from "../../customers/CustomerFormDrawer";
import { IoSearchOutline } from "react-icons/io5";
import { useEffect, useRef } from "react";
export default function CustomerModal({
  response,
  onClose,
  isOpen,
  customerProps,
  customerFormProps,
  formik,
  loading,
  onChangeInput,
  nextPage,
  previousPage,
  search,
}) {
  const { items: customers, page, totalPages } = response;
  const {
    isOpenCustomerFormDrawer,
    onCloseCustomerFormDrawer,
    onOpenCustomerFormDrawer,
  } = customerFormProps;
  const searchRef = useRef(null);
  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchRef]);
  return (
    <Modal size={"2xl"} onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Customers</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex justifyContent={"space-around"} alignItems={"center"}>
            <PaginateButtons
              nextPage={nextPage}
              previousPage={previousPage}
              page={page}
              totalPages={totalPages}
            />
            <ButtonGroup>
              <Button
                variant={"outline"}
                onClick={() => customerProps.selectCustomer("")}
              >
                Clear
              </Button>
              <Button
                variant={"solid"}
                colorScheme="blue"
                onClick={onOpenCustomerFormDrawer}
              >
                Add
              </Button>
            </ButtonGroup>
          </Flex>
          <Skeleton isLoaded={!loading}>
            <TableContainer>
              <Table variant="simple">
                <TableCaption>
                  <InputGroup margin={"auto"}>
                    <InputLeftElement pointerEvents="none">
                      <IoSearchOutline />
                    </InputLeftElement>
                    <Input
                      disabled={loading}
                      ref={searchRef}
                      type="search"
                      value={search}
                      onChange={onChangeInput}
                      isDisabled={false}
                    />
                  </InputGroup>
                </TableCaption>
                <Thead>
                  <Tr>
                    <Th>Select</Th>
                    <Th>Customer Name</Th>
                    <Th>Billing address</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {customers.map((customer) => (
                    <Tr cursor={"pointer"} key={customer._id}>
                      <Td>
                        <Checkbox
                          isChecked={
                            customerProps.selectedCustomer === customer._id
                          }
                          size="lg"
                          onChange={() => {
                            customerProps.selectCustomer(customer._id);
                            onClose();
                          }}
                          isDisabled={false}
                          colorScheme="orange"
                        />
                      </Td>
                      <Td>{customer.name}</Td>
                      <Td>{customer.billingAddress}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Skeleton>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
      <CustomerFormDrawer
        formik={formik}
        isOpen={isOpenCustomerFormDrawer}
        onClose={onCloseCustomerFormDrawer}
      />
    </Modal>
  );
}
