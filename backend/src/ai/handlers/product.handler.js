const { productDto } = require("../../dto/product.dto");
const productService = require("../../services/product.service");
const { getDetailedSettingForOrg } = require("../../services/setting.service");
const { getUmListForOrg } = require("../../services/um.service");
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
  create_product: async ({ org, ...params }) => {
    try {
      const body = await productDto.validateAsync(params);
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
      return product;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = productHandlers;
