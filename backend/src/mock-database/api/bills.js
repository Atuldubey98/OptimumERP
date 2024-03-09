module.exports = ({ axios, cookie, orgId, entity }) => {
  function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
  }
  function getRandomDate() {
    const today = new Date();
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const randomTimestamp = oneMonthAgo.getTime() + Math.random() * (today.getTime() - oneMonthAgo.getTime());
    const randomDate = new Date(randomTimestamp);
    return randomDate
  }
  
  function createBill(bill) {
    return axios.post(`/api/v1/organizations/${orgId}/${entity}`, bill, {
      headers: {
        Cookie: cookie,
      },
    });
  }
  async function getBills() {
    const customersResponse = await axios.get(
      `/api/v1/organizations/${orgId}/customers`,
      {
        headers: {
          Cookie: cookie,
        },
      }
    );
    const productsReponse = await axios.get(
      `/api/v1/organizations/${orgId}/products`,
      {
        headers: {
          Cookie: cookie,
        },
      }
    );
    const idMapper = (item) => item._id;
    const customerIds = customersResponse.data.data.map(idMapper);
    const products = productsReponse.data.data;
    const bills = new Array(1000).fill(0).map((_, index) => {
      const customer = customerIds[getRandomInt(0, customerIds.length)];
      const items = new Array(5).fill(0).map(() => {
        const product = products[getRandomInt(0, products.length)];
        return {
          name: product.name,
          quantity: getRandomInt(0, 5),
          um: "kg",
          gst: "GST:18",
          price: product.sellingPrice,
        };
      });
      return {
        num: index,
        date: new Date().toISOString().split("T")[0],
        status: "draft",
        customer,
        items,
        invoiceNo: index,
        terms: "",
        description: "",
      };
    });
    return bills;
  }
  async function createManyBills() {
    const bills = await getBills();
    await Promise.all(bills.map((bill) => createBill(bill)));
  }
  return {
    createManyBills,
  };
};
