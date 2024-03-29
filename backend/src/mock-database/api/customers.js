const read = require("../read");

module.exports = ({ axios, cookie, orgId }) => {
  function createParty(party) {
    return axios.post(`/api/v1/organizations/${orgId}/parties`, party, {
      headers: {
        Cookie: cookie,
      },
    });
  }
  async function getPartys() {
    const data = await read(
      "/home/atul/Development/erp_mern/backend/src/mock-database/raw-data/parties.csv"
    );
    return data;
  }
  async function createManyPartys() {
    const parties = await getPartys();
    await Promise.all(parties.map((party) => createParty(party)));
  }
  return {
    createParty,
    getPartys,
    createManyPartys,
  };
};
