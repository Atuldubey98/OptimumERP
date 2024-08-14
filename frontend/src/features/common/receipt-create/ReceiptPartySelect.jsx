import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import usePartyForm from "../../../hooks/usePartyForm";
import AsyncSearchableSelect from "./AsyncSearchableSelect";
import PartyFormDrawer from "../../parties/PartyFormDrawer";
import { useParams } from "react-router-dom";

export default function ReceiptPartySelect({ formik, partyNameLabel }) {
  const addressHeadColor = useColorModeValue("gray.500", "gray.300");

  const { isOpen: isPartyFormOpen, onToggle: onTogglePartyFormDrawer } =
    useDisclosure();
  const { formik: partyFormik } = usePartyForm((party) => {
    formik.setFieldValue("party", party);
  }, onTogglePartyFormDrawer);
  const { orgId } = useParams();

  return (
    <>
      <FormControl isInvalid={formik.errors.party && formik.touched.party}>
        <FormLabel>{partyNameLabel}</FormLabel>
        <AsyncSearchableSelect
          optionsCb={(party) => ({
            value: party,
            label: party.name,
          })}
          getParamsFromSearchQuery={(searchQuery) => ({
            params: {
              keyword: searchQuery,
            },
          })}
          onCreateOption={(partyName) => {
            partyFormik.setValues({
              name: partyName,
              billingAddress: "",
              gstNo: "",
              panNo: "",
              shippingAddress: "",
            });
            onTogglePartyFormDrawer();
          }}
          value={
            formik.values.party
              ? {
                  label: formik.values.party?.name,
                  value: formik.values.party,
                }
              : undefined
          }
          onChange={(party) => {
            formik.setFieldValue("party", party.value);
          }}
          url={`/api/v1/organizations/${orgId}/parties/search`}
        />
        {formik.values.party ? (
          <Button
            onClick={() => {
              partyFormik.setValues(formik.values.party);
              onTogglePartyFormDrawer();
            }}
            variant={"link"}
          >
            Edit party
          </Button>
        ) : null}
        <FormErrorMessage>{formik.errors.party}</FormErrorMessage>
      </FormControl>
      {formik.values.party ? (
        <SimpleGrid gap={2} minChildWidth={300}>
          <Box>
            <Text color={addressHeadColor} textTransform={"uppercase"}>
              Billing address
            </Text>
            <Text>{formik.values.party?.billingAddress}</Text>
          </Box>
          <Box>
            <Text color={addressHeadColor} textTransform={"uppercase"}>
              Shipping Address
            </Text>
            <Text>{formik.values.party?.shippingAddress}</Text>
          </Box>
        </SimpleGrid>
      ) : null}
      <PartyFormDrawer
        formik={partyFormik}
        isOpen={isPartyFormOpen}
        onClose={onTogglePartyFormDrawer}
      />
    </>
  );
}
