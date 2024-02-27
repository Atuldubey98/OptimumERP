import {
  Button,
  ButtonGroup,
  Checkbox,
  Flex,
  Heading,
  Input,
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
} from "@chakra-ui/react";
import CustomerFormDrawer from "../../customers/CustomerFormDrawer";
import useDebouncedInput from "../../../hooks/useDeboucedInput";

export default function CustomerModal({
  customers,
  onClose,
  isOpen,
  customerProps,
  customerFormProps,
  formik,
  onChangeInput,
  search,
}) {
  const {
    isOpenCustomerFormDrawer,
    onCloseCustomerFormDrawer,
    onOpenCustomerFormDrawer,
  } = customerFormProps;
  return (
    <Modal size={"2xl"} onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Customers</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex justifyContent={"flex-end"} alignItems={"center"}>
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
          {customers.length ? (
            <TableContainer>
              <Table variant="simple">
                <TableCaption>
                  <Input
                    type="search"
                    value={search}
                    onChange={onChangeInput}
                    isDisabled={false}
                  />
                </TableCaption>
                <Thead>
                  <Tr>
                    <Th>Select</Th>
                    <Th>Customer Name</Th>
                    <Th>Billing address</Th>
                    <Th>GST</Th>
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
                      <Td>{customer.gstNo}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Heading textAlign={"center"}>No customer found </Heading>
          )}
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
