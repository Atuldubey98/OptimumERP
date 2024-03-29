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
import PartyFormDrawer from "../../parties/PartyFormDrawer";
import { IoSearchOutline } from "react-icons/io5";
import { useEffect, useRef } from "react";
export default function PartyModal({
  response,
  onClose,
  isOpen,
  partyProps,
  partyFormProps,
  formik,
  loading,
  onChangeInput,
  nextPage,
  previousPage,
  search,
}) {
  const { items: parties, page, totalPages } = response;
  const {
    isOpenPartyFormDrawer,
    onClosePartyFormDrawer,
    onOpenPartyFormDrawer,
  } = partyFormProps;
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
        <ModalHeader>Select Parties</ModalHeader>
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
                onClick={() => partyProps.selectParty("")}
              >
                Clear
              </Button>
              <Button
                variant={"solid"}
                colorScheme="blue"
                onClick={onOpenPartyFormDrawer}
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
                    <Th>Party Name</Th>
                    <Th>Billing address</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {parties.map((party) => (
                    <Tr cursor={"pointer"} key={party._id}>
                      <Td>
                        <Checkbox
                          isChecked={
                            partyProps.selectedParty === party._id
                          }
                          size="lg"
                          onChange={() => {
                            partyProps.selectParty(party._id);
                            onClose();
                          }}
                          isDisabled={false}
                          colorScheme="orange"
                        />
                      </Td>
                      <Td>{party.name}</Td>
                      <Td>{party.billingAddress}</Td>
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
      <PartyFormDrawer
        formik={formik}
        isOpen={isOpenPartyFormDrawer}
        onClose={onClosePartyFormDrawer}
      />
    </Modal>
  );
}
