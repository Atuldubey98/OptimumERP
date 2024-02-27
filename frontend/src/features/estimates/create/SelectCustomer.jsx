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
  const [customers, setCustomers] = useState([]);
  const { orgId } = useParams();
  const {
    input: search,
    deboucedInput: deboucedSearch,
    onChangeInput,
  } = useDebouncedInput();
  const { requestAsyncHandler } = useAsyncCall();
  const fetchCustomer = useCallback(
    requestAsyncHandler(async () => {
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/customers`,
        {
          params: {
            search: deboucedSearch,
          },
        }
      );
      setCustomers(data.data);
    }),
    [deboucedSearch]
  );
  useEffect(() => {
    fetchCustomer();
  }, [deboucedSearch]);
  const selectCustomer = (customerId) => {
    formik.setFieldValue("customer", customerId);
  };
  const customerProps = {
    selectCustomer,
    selectedCustomer: formik.values.customer,
  };
  const customer = customers.find(
    (customer) => customer._id === formik.values.customer
  );
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
        customers={customers}
        onClose={onClose}
        formik={customerFormik}
        onChangeInput={onChangeInput}
        search={search}
        isOpen={isOpen}
        customerProps={customerProps}
      />
    </>
  );
}
