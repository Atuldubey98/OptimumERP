const read = require("../read");
module.exports = (axios) => {
  function registerUser(user) {
    return axios.post(`/api/v1/users/register`, user);
  }
  function loginUser(user) {
    return axios.post(`/api/v1/users/login`, user);
  }
  async function getAllUsers() {
    const data = await read(
      `/home/atul/Development/erp_mern/backend/src/mock-database/raw-data/users.csv`
    );
    return data;
  }
  async function registerManyUsers() {
    const users = await getAllUsers();
    await Promise.all(
      users.map((user) => registerUser(user))
    );
  }
  return {
    registerUser,
    loginUser,
    getAllUsers,
    registerManyUsers,
  };
};
