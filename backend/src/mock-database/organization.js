const Organization = require("../models/org.model");
const OrgUser = require("../models/org_user.model");
module.exports = {
  createOrganization: async function (userId) {
    const organization = {
      name: "S R Refrigeration and Electricals",
      address: "6G-Nyaykhand - I GZB UP",
      gstNo: "AJSIKJAS89ASHKl",
      panNo: "HASIH91723AHS",
      createdBy: userId
    };
    const newOrg = new Organization(organization);
    await newOrg.save();
    const orgUser = new OrgUser({
      org: newOrg.id,
      user: userId,
      role: "admin",
    });
    return orgUser.save();
  },
};
