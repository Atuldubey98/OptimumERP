import {
  FormControl,
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
import useCustomerForm from "../../../hooks/useCustomerForm";
import instance from "../../../instance";
import CustomerModal from "./CustomerModal";
import useDebouncedInput from "../../../hooks/useDeboucedInput";
export default function SelectCustomer({ formik }) {
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
  const fetchCustomer = useCallback(
    requestAsyncHandler(async () => {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/customers`,
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
  const { items: customers } = response;
  useEffect(() => {
    fetchCustomer();
  }, [deboucedSearch, currentPage]);
  const selectCustomer = (customerId) =>
    formik.setFieldValue("customer", customerId);

  const customerProps = {
    selectCustomer,
    selectedCustomer: formik.values.customer,
  };
  const customer = customers.find(
    (customer) => customer._id === formik.values.customer
  );
  const loading = status === "loading";
  const {
    isOpen: isOpenCustomerFormDrawer,
    onOpen: onOpenCustomerFormDrawer,
    onClose: onCloseCustomerFormDrawer,
  } = useDisclosure();
  const customerFormProps = {
    isOpenCustomerFormDrawer,
    onCloseCustomerFormDrawer,
    onOpenCustomerFormDrawer,
  };
  const { formik: customerFormik } = useCustomerForm(
    fetchCustomer,
    onCloseCustomerFormDrawer
  );
  return (
    <>
      <FormControl isReadOnly isRequired>
        <FormLabel>Customer</FormLabel>
        <InputGroup>
          <Input
            placeholder="Select Customer"
            value={customer ? customer.name : "Select a customer"}
            readOnly={true}
          />
          <InputRightElement>
            <TbEyeSearch cursor={"pointer"} onClick={onOpen} size={25} />
          </InputRightElement>
        </InputGroup>
      </FormControl>
      {customer ? (
        <FormControl isRequired>
          <FormLabel>Address</FormLabel>
          <Textarea readOnly value={customer.billingAddress} />
        </FormControl>
      ) : null}
      <CustomerModal
        customerFormProps={customerFormProps}
        response={response}
        onClose={onClose}
        formik={customerFormik}
        onChangeInput={onChangeInput}
        search={search}
        isOpen={isOpen}
        loading={loading}
        nextPage={() => setCurrentPage((prev) => prev + 1)}
        previousPage={() => setCurrentPage((prev) => prev - 1)}
        customerProps={customerProps}
      />
    </>
  );
}
