const { productDto } = require("../../dto/product.dto");
const productService = require("../../services/product.service");
const { getDetailedSettingForOrg, getDisplaySettingForOrg } = require("../../services/setting.service");
const { getUmListForOrg } = require("../../services/um.service");
const { moneyUtils } = require("../../utils");
const formalizeProductForAi = (product, decimalDigits) => {
  if (!product) return null;
  return {
    _id: product._id,
    name: product.name,
    sellingPrice: moneyUtils.fromSmallestUnit(product.sellingPrice || 0, decimalDigits),
    costPrice: moneyUtils.fromSmallestUnit(product.costPrice || 0, decimalDigits),
    code: product.code,
    type: product.type,
  };
};

const productHandlers = {
  get_product_details: async (params) => {
    try {
      const productsForAi = await productService.getProductDetailsForAI(
        params.query,
        params.type,
        params?.org,
      );
      return productsForAi;
    } catch (error) {
      throw error;
    }
  },
  create_product: async ({ org, createdBy, user, ...params }) => {
    try {
      const displaySetting = await getDisplaySettingForOrg(org);
      const currencyConfig = displaySetting
        ? await moneyUtils.getCurrencyConfigByCode(displaySetting.currency)
        : null;
      const decimalDigits = currencyConfig?.decimal_digits ?? 2;
      const toSmallest = (val) => moneyUtils.toSmallestUnit(val, decimalDigits);

      const rawParams = {
        ...params,
        ...(params.costPrice != null && { costPrice: toSmallest(params.costPrice) }),
        ...(params.sellingPrice != null && { sellingPrice: toSmallest(params.sellingPrice) }),
      };

      const body = await productDto.parseAsync({ ...rawParams, createdBy: createdBy?.toString() });
      const setting = await getDetailedSettingForOrg(org);
      let um = setting?.receiptDefaults?.um?._id?.toString();
      if (body?.um) {
        const ums = await getUmListForOrg(org);
        const storedUm = ums.find((um) => {
          const searchTerm = body?.um.toLowerCase();
          if (!searchTerm) return false;
          return (
            um.name.toLowerCase().includes(searchTerm) ||
            um.unit.toLowerCase().includes(searchTerm)
          );
        });

        um = storedUm
          ? storedUm._id.toString()
          : setting?.receiptDefaults?.um?._id?.toString();
      }
      body.um = um;
      body.org = org;
      const product = await productService.create(body);
      return formalizeProductForAi(product, decimalDigits);
    } catch (error) {
      throw error;
    }
  },
};

module.exports = productHandlers;
