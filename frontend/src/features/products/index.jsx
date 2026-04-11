import {
  Box,
  Flex,
  Spinner,
  Tag,
  TagLabel,
  TagLeftIcon,
  useDisclosure,
} from "@chakra-ui/react";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { CgProductHunt } from "react-icons/cg";
import { MdOutlineHomeRepairService } from "react-icons/md";
import { useParams } from "react-router-dom";
import useAsyncCall from "../../hooks/useAsyncCall";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import useProductForm from "../../hooks/useProductForm";
import useProducts from "../../hooks/useProducts";
import useQuery from "../../hooks/useQuery";
import instance from "../../instance";
import AlertModal from "../common/AlertModal";
import ShowDrawer from "../common/ShowDrawer";
import MainLayout from "../common/main-layout";
import Pagination from "../common/main-layout/Pagination";
import TableLayout from "../common/table-layout";
import SearchItem from "../common/table-layout/SearchItem";
import { useTranslation } from "react-i18next";
import ProductFormDrawer from "./ProductFormDrawer";
import ProductMenu from "./ProductMenu";
export default function ProductsPage() {
  const { t } = useTranslation("product");
  const {
    isOpen: isProductFormOpen,
    onClose: onCloseProductFormDrawer,
    onOpen: openProductFormDrawer,
  } = useDisclosure();
  const {
    isOpen: isProductDrawerOpen,
    onClose: closeProductDrawer,
    onOpen: openProductDrawer,
  } = useDisclosure();
  const query = useQuery();
  const search = query.get("query");
  const [selectedToShowProduct, setSelectedToShowProduct] = useState(null);
  const {
    fetchProducts,
    loading,
    products,
    totalCount,
    totalPages,
    currentPage,
    reachedLimit,
  } = useProducts();
  const { orgId = "", productCategoryId } = useParams();
  const [heading, setHeading] = useState();

  const fetchCategoryByCategoryId = async () => {
    if (productCategoryId) {
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/productCategories/${productCategoryId}?select=name`
      );
      setHeading(t("product_ui.page.heading_with_category", { category: data.data.name }));
    } else {
      setHeading(t("product_ui.page.heading"));
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategoryByCategoryId();
  }, [search, fetchProducts, productCategoryId]);
  const { formik } = useProductForm(fetchProducts, onCloseProductFormDrawer);
  const onOpenProduct = (product) => {
    setSelectedToShowProduct(product);
    openProductDrawer();
  };
  const onOpenDrawerForAddingNewProduct = () => {
    formik.setValues({
      name: "",
      costPrice: 0,
      sellingPrice: 0,
      description: "",
      type: "goods",
      code: "",
      um: "none",
    });
    openProductFormDrawer();
  };
  const onOpenDrawerForEditingProduct = (product) => {
    formik.setValues({
      ...product,
      categoryProps: product.category,
      category: product.category ? product.category._id : "",
      um: product.um?._id,
    });
    openProductFormDrawer();
  };
  const { requestAsyncHandler } = useAsyncCall();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure();
  const onOpenDeleteModal = (currentProduct) => {
    setSelectedToShowProduct(currentProduct);
    openDeleteModal();
  };
  const [productStatus, setProductStatus] = useState("idle");
  const deleting = productStatus === "deleting";
  const onDeleteProduct = requestAsyncHandler(async () => {
    if (!selectedToShowProduct) return;
    setProductStatus("deleting");
    await instance.delete(
      `/api/v1/organizations/${orgId}/products/${selectedToShowProduct._id}`
    );
    fetchProducts();
    closeDeleteModal();
    setProductStatus("idle");
  });
  const { getAmountWithSymbol } = useCurrentOrgCurrency();
  const productsMapper = (product) => ({
    ...product,
    um: product.um.name,
    costPrice: getAmountWithSymbol(product.costPrice),
    sellingPrice: getAmountWithSymbol(product.sellingPrice),
    type: (
      <Tag
        textTransform={"capitalize"}
        size={"md"}
        variant={"solid"}
        colorScheme={"blue"}
      >
        <TagLeftIcon
          boxSize="12px"
          as={
            product.type === "service"
              ? MdOutlineHomeRepairService
              : CgProductHunt
          }
        />
        <TagLabel>{product.type}</TagLabel>
      </Tag>
    ),
  });

  return (
    <MainLayout>
      <Box p={5}>
        {loading ? (
          <Flex justifyContent={"center"} alignItems={"center"}>
            <Spinner size={"md"} />
          </Flex>
        ) : (
          <TableLayout
            isAddDisabled={reachedLimit}
            filter={
              <Box maxW={"md"}>
                <SearchItem />
              </Box>
            }
            limitKey={"products"}
            heading={heading}
            tableData={products.map(productsMapper)}
            caption={`${t("product_ui.page.total_found")} : ${totalCount}`}
            operations={products.map((product) => (
              <ProductMenu
                onDeleteProduct={() => {
                  onOpenDeleteModal(product);
                }}
                product={product}
                key={product._id}
                onOpenProduct={onOpenProduct}
                onOpenDrawerForEditingProduct={onOpenDrawerForEditingProduct}
              />
            ))}
            selectedKeys={{
              name: t("product_ui.table.columns.name"),
              costPrice: t("product_ui.table.columns.cost_price"),
              sellingPrice: t("product_ui.table.columns.selling_price"),
              type: t("product_ui.table.columns.type"),
              um: t("product_ui.table.columns.um"),
            }}
            onAddNewItem={onOpenDrawerForAddingNewProduct}
          />
        )}
        {loading ? null : (
          <Pagination total={totalPages} currentPage={currentPage} />
        )}
        {selectedToShowProduct ? (
          <ShowDrawer
            disable={reachedLimit}
            onClickNewItem={onOpenDrawerForAddingNewProduct}
            heading={t("product_ui.drawer.heading")}
            formBtnLabel={t("product_ui.drawer.add_button")}
            isOpen={isProductDrawerOpen}
            item={{
              ...selectedToShowProduct,
              um: selectedToShowProduct.um.name,
              costPrice: getAmountWithSymbol(selectedToShowProduct.costPrice),
              sellingPrice: getAmountWithSymbol(selectedToShowProduct.sellingPrice),
              type: selectedToShowProduct.type?.toUpperCase(),
              createdAt: moment(selectedToShowProduct.createdAt).format("LL"),
            }}
            onClose={closeProductDrawer}
            selectedKeys={{
              name: t("product_ui.drawer.columns.name"),
              costPrice: t("product_ui.drawer.columns.cost_price"),
              type: t("product_ui.drawer.columns.type"),
              sellingPrice: t("product_ui.drawer.columns.selling_price"),
              createdAt: t("product_ui.drawer.columns.created_at"),
              description: t("product_ui.drawer.columns.description"),
              um: t("product_ui.drawer.columns.um"),
            }}
          />
        ) : null}
        <AlertModal
          confirmDisable={deleting}
          body={t("product_ui.modal.delete_body")}
          header={t("product_ui.modal.delete_header")}
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={onDeleteProduct}
        />

        <ProductFormDrawer
          formik={formik}
          isOpen={isProductFormOpen}
          onClose={onCloseProductFormDrawer}
        />
      </Box>
    </MainLayout>
  );
}
