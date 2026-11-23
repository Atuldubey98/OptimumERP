const { getUmListForOrg } = require("../../services/um.service");
const { getDetailedSettingForOrg } = require("../../services/setting.service");

const umHandler = {
  get_ums: async (params) => {
    const ums = await getUmListForOrg(params.org);
    const setting = await getDetailedSettingForOrg(params.org);
    const defaultUmId = setting?.receiptDefaults?.um?._id?.toString() || setting?.receiptDefaults?.um?.toString();

    let filtered = ums.filter((u) => u.enabled !== false);

    if (params?.query && params.query.trim()) {
      const q = params.query.trim().toLowerCase();
      filtered = filtered.filter((u) => {
        return (
          u.name.toLowerCase().includes(q) ||
          u.unit.toLowerCase().includes(q)
        );
      });
    }

    return filtered.map((u) => ({
      _id: u._id,
      name: u.name,
      unit: u.unit,
      description: u.description || "",
      isDefault: String(u._id) === defaultUmId,
    }));
  },
};

module.exports = umHandler;
