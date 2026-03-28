import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { TbEyeSearch } from "react-icons/tb";
import { useParams } from "react-router-dom";
import useAsyncCall from "../../../hooks/useAsyncCall";
import usePartyForm from "../../../hooks/usePartyForm";
import instance from "../../../instance";
import PartyModal from "./PartyModal";
import useDebouncedInput from "../../../hooks/useDeboucedInput";
import { useTranslation } from "react-i18next";
export default function SelectParty({ formik }) {
  const { t } = useTranslation("common");
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [response, setResponse] = useState({
    items: [],
    totalPages: 0,
    total: 0,
    page: 0,
  });
  const { orgId } = useParams();
  const {
    input: search,
    deboucedInput: deboucedSearch,
    onChangeInput,
  } = useDebouncedInput(() => {
    setCurrentPage(1);
  });
  const { requestAsyncHandler } = useAsyncCall();
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState("idle");
  const fetchParty = useCallback(
    requestAsyncHandler(async () => {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/parties`,
        {
          params: {
            search: deboucedSearch,
            page: currentPage,
          },
        }
      );
      setResponse({
        items: data.data,
        page: data.page,
        total: data.total,
        totalPages: data.totalPages,
      });
      setStatus("success");
    }),
    [deboucedSearch, currentPage]
  );
  const { items: parties } = response;
  useEffect(() => {
    fetchParty();
  }, [deboucedSearch, currentPage]);
  const selectParty = (partyId) =>
    formik.setFieldValue("party", partyId);

  const partyProps = {
    selectParty,
    selectedParty: formik.values.party,
  };
  const party = parties.find(
    (party) => party._id === formik.values.party
  );
  const loading = status === "loading";
  const {
    isOpen: isOpenPartyFormDrawer,
    onOpen: onOpenPartyFormDrawer,
    onClose: onClosePartyFormDrawer,
  } = useDisclosure();
  const partyFormProps = {
    isOpenPartyFormDrawer,
    onClosePartyFormDrawer,
    onOpenPartyFormDrawer,
  };
  const { formik: partyFormik } = usePartyForm(
    fetchParty,
    onClosePartyFormDrawer
  );

  return (
    <>
      <FormControl
        isInvalid={!!formik.errors.password && formik.touched.password}
        isReadOnly
        isRequired
      >
        <FormLabel>{t("common_ui.fields.party")}</FormLabel>
        <InputGroup>
          <Input
            required
            placeholder={t("common_ui.selectors.select_party")}
            value={party ? party.name : t("common_ui.selectors.select_a_party")}
            readOnly={true}
          />
          <InputRightElement>
            <TbEyeSearch cursor={"pointer"} onClick={onOpen} size={25} />
          </InputRightElement>
        </InputGroup>
        <FormErrorMessage>{formik.errors.party}</FormErrorMessage>
      </FormControl>
      {party ? (
        <FormControl isRequired>
          <FormLabel>{t("common_ui.fields.address")}</FormLabel>
          <Textarea readOnly value={party.billingAddress} />
        </FormControl>
      ) : null}
      <PartyModal
        partyFormProps={partyFormProps}
        response={response}
        onClose={onClose}
        formik={partyFormik}
        onChangeInput={onChangeInput}
        search={search}
        isOpen={isOpen}
        loading={loading}
        nextPage={() => setCurrentPage((prev) => prev + 1)}
        previousPage={() => setCurrentPage((prev) => prev - 1)}
        partyProps={partyProps}
      />
    </>
  );
}
