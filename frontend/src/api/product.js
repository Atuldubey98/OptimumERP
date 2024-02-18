import instance from "../instance";

export const getProducts = ({ page, limit, search, orgId }) => {
  return instance.get(`/api/v1/organizations/${orgId}/products`, {
    params: {
      page,
      limit,
      search,
    },
  });
};

export const createProduct = ({ product, orgId }) => {
  return instance.post(`/api/v1/organizations/${orgId}/products`, product);
};

export const updateProduct = ({ product, orgId, productId }) => {
  return instance.patch(
    `/api/v1/organizations/${orgId}/products/${productId}`,
    product
  );
};

export const deletProduct = (productId, orgId) =>{
  return instance.delete(`/api/v1/organizations/${orgId}/products/${productId}`)
}