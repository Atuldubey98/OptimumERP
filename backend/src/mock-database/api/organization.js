module.exports = (axios, cookie) => {
  function createOrganization(organization) {
    return axios.post(`/api/v1/organizations`, organization, {
      headers: {
        Cookie: cookie,
      },
    });
  }
  return {
    createOrganization,
  };
};
