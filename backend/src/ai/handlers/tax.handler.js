const { getTaxListForOrg } = require("../../services/tax.service");
const { getDetailedSettingForOrg } = require("../../services/setting.service");

const taxHandler = {
  get_taxes: async (params) => {
    const taxes = await getTaxListForOrg(params.org);
    const setting = await getDetailedSettingForOrg(params.org);
    const defaultTaxId = setting?.receiptDefaults?.tax?._id?.toString() || setting?.receiptDefaults?.tax?.toString();

    let filtered = taxes.filter((t) => t.enabled !== false);

    if (params?.query && params.query.trim()) {
      const q = params.query.trim().toLowerCase();
      filtered = filtered.filter((t) => {
        return (
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          String(t.percentage).includes(q)
        );
      });
    }

    return filtered.map((t) => {
      const components = Array.isArray(t.children) && t.children.length
        ? t.children.map((c) => (c.name ? `${c.name} (${c.percentage}%)` : String(c._id || c)))
        : [];

      return {
        _id: t._id,
        name: t.name,
        percentage: t.percentage,
        category: t.category,
        type: t.type,
        description: t.description || "",
        isDefault: String(t._id) === defaultTaxId,
        ...(components.length && { components }),
      };
    });
  },
};

module.exports = taxHandler;
