import {
    Button,
    ButtonGroup,
    Checkbox,
    Flex,
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
    Tr
} from "@chakra-ui/react";
import { useState } from "react";
import CustomerFormDrawer from "../../customers/CustomerFormDrawer";

export default function CustomerModal({
  customers,
  onClose,
  isOpen,
  customerProps,
  customerFormProps,
  formik,
}) {
  const [search, setSearch] = useState(false);

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
              <Button onClick={onOpenCustomerFormDrawer}>Add</Button>
            </ButtonGroup>
          </Flex>
          <TableContainer>
            <Table variant="simple">
              <TableCaption>
                <Input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
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
                {customers
                  .filter(
                    (customer) => !search || customer.name.includes(search)
                  )
                  .map((customer) => (
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
