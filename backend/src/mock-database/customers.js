const Customer = require("../models/customer.model");
module.exports = {
  createCustomer: async function (customer, orgId) {
    const newCustomer = new Customer({ ...customer, org: orgId });
    return newCustomer.save();
  },
  createManyCustomers: async function (lorem, orgId, userId) {
    const customers = [];
    for (let i = 0; i < 100; i++) {
      customers.push({
        name: lorem.generateWords(3),
        shippingAddress: lorem.generateWords(5),
        billingAddress: lorem.generateWords(5),
        gstNo: "APEPDIAS&79ASH",
        createdBy: userId,
        panNo: "ALJAOUSAJS0789",
      });
    }
    const newCustomers = await Customer.insertMany(
      customers.map((customer) => ({ ...customer, org: orgId }))
    );
    return newCustomers;
  },
};
