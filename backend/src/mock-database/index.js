const axios = require("axios").default;

const instance = axios.create({
  baseURL: `http://127.0.0.1:9000`,
});
const userApi = require("./api/users");
const orgApi = require("./api/organization");
const productApi = require("./api/products");
const partysApi = require("./api/parties");
const billsApi = require("./api/bills");
const users = userApi(instance);
(async () => {
  await users.registerManyUsers();
  const cookie = await users
    .loginUser({
      email: "pcurnock0@cpanel.net",
      password: "12345678",
    })
    .then((data) => {
      return data.headers["set-cookie"];
    });
  const org = orgApi(instance, cookie);

  const { data } = await org.createOrganization({
    name: "S R Refrigeration and Electricals",
    address: "6-G Nyaykhand-1 GZB Noida UP",
    gstNo: "89899JHAJKSH78",
    panNo: "AHSJAS87897",
    financialYear: {
      start: "2023-04-01",
      end: "2024-03-31",
    },
  });
  const products = productApi({
    axios: instance,
    cookie,
    orgId: data.data._id,
  });
  const parties = partysApi({
    axios: instance,
    cookie,
    orgId: data.data._id,
  });
  const invoices = billsApi({
    axios: instance,
    cookie,
    orgId: data.data._id,
    entity: "invoices",
  });
  await products.createManyProducts();
  await parties.createManyPartys();
  await invoices.createManyBills();
})();
