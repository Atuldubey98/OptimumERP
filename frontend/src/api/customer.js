import instance from "../instance";
import { getCustomerUrl } from "./utils";

export const getCustomers = (orgId, search) => {
  return instance.get(getCustomerUrl(orgId), {
    params: {
      search,
    },
  });
};

export const createCustomer = (customer, orgId) => {
  return instance.post(getCustomerUrl(orgId), customer);
};

export const updateCustomer = (customer, orgId) => {
  const { _id, ...customerToUpdate } = customer;
  const url = `${getCustomerUrl(orgId)}/${_id}`;
  return instance.patch(url, customerToUpdate);
};
