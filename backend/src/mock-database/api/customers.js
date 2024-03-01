const read = require("../read");

module.exports = ({ axios, cookie, orgId }) => {
  function createCustomer(customer) {
    return axios.post(`/api/v1/organizations/${orgId}/customers`, customer, {
      headers: {
        Cookie: cookie,
      },
    });
  }
  async function getCustomers() {
    const data = await read(
      "/home/atul/Development/erp_mern/backend/src/mock-database/raw-data/customers.csv"
    );
    return data;
  }
  async function createManyCustomers() {
    const customers = await getCustomers();
    await Promise.all(customers.map((customer) => createCustomer(customer)));
  }
  return {
    createCustomer,
    getCustomers,
    createManyCustomers,
  };
};
