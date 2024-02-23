import {
    Box,
    Button,
    ButtonGroup,
    Grid,
    Heading,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text
} from "@chakra-ui/react";

import ItemList from "./ItemList";
export default function QuoteModal({ onClose, isOpen, quotation }) {
  return (
    <Modal
      size={"full"}
      onClose={onClose}
      isOpen={isOpen}
      scrollBehavior={"inside"}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Quotation</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box padding={10}>
            <Text textAlign={"center"}>Quotation</Text>
            <Box
              fontSize={"2xl"}
              marginBlock={2}
              borderWidth={2}
              borderColor={"lighgray"}
            >
              <Grid gridTemplateColumns={"1fr 1fr"}>
                <Grid>
                  <Box
                    padding={2}
                    borderBottomWidth={2}
                    borderRightWidth={2}
                    borderColor={"lightgray"}
                  >
                    <Heading>{quotation.org.name}</Heading>
                    <Text>{quotation.org.address}</Text>
                    <Text>{quotation.org.gstNo || ""}</Text>
                    <Text>{quotation.org.panNo || ""}</Text>
                  </Box>
                  <Box
                    borderRightWidth={2}
                    borderColor={"lightgray"}
                    padding={2}
                  >
                    <Text>Bill To</Text>
                    <Text fontWeight={"bold"} textTransform={"capitalize"}>
                      {quotation.customer.name}
                    </Text>
                    <Text>{quotation.customer.billingAddress}</Text>
                    <Text>{quotation.customer.gstNo}</Text>
                    <Text>{quotation.customer.panNo}</Text>
                  </Box>
                </Grid>
                <Grid>
                  <Grid gridTemplateColumns={"1fr 1fr"}>
                    <Box
                      padding={2}
                      borderRightWidth={2}
                      borderColor={"lightgray"}
                    >
                      <Text>Quote No</Text>
                      <Text fontWeight={"bold"}>{quotation.quoteNo}</Text>
                    </Box>
                    <Box padding={2}>
                      <Text>Quotation date</Text>
                      <Text fontWeight={"bold"}>
                        {new Date(quotation.date).toISOString().split("T")[0]}
                      </Text>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              <ItemList items={quotation.items} />
              <Grid
                borderTopWidth={2}
                borderColor={"lightgray"}
                gridTemplateColumns={"1fr 1fr"}
              >
                <Box borderRightWidth={2} borderColor={"lightgray"}></Box>
                <Box padding={2}>
                  <Text>Sub Total</Text>
                  <Text fontWeight={"bold"}>
                    {quotation.items.reduce(
                      (prev, curr) => prev + curr.price * curr.quantity,
                      0
                    )}
                  </Text>
                </Box>
              </Grid>
            </Box>
          </Box>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button onClick={onClose}>Close</Button>
            <Button onClick={toPDF} colorScheme="blue">
              Save as PDF
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
