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
import { ums } from "../estimates/create/data";
import ProductFormDrawer from "./ProductFormDrawer";
import ProductMenu from "./ProductMenu";
export default function ProductsPage() {
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
      setHeading(`Items (${data.data.name})`);
    } else {
      setHeading("Items");
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
  const { symbol } = useCurrentOrgCurrency();
  const productsMapper = (product) => ({
    ...product,
    um: ums.find((um) => um.value === product.um).label || "Nos",
    costPrice: `${symbol} ${product.costPrice}`,
    sellingPrice: `${symbol} ${product.sellingPrice}`,
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
            caption={`Total items found : ${totalCount}`}
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
              name: "Name",
              costPrice: "Cost Price",
              sellingPrice: "Selling Price",
              type: "Item Type",
              um: "Unit of measurement",
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
            heading={"Product"}
            formBtnLabel={"Add new"}
            isOpen={isProductDrawerOpen}
            item={{
              ...selectedToShowProduct,
              um:
                ums.find((um) => um.value === selectedToShowProduct.um).label ||
                "AU",
              costPrice: `${symbol} ${selectedToShowProduct.costPrice}`,
              sellingPrice: `${symbol} ${selectedToShowProduct.sellingPrice}`,
              type: selectedToShowProduct.type?.toUpperCase(),
              createdAt: moment(selectedToShowProduct.createdAt).format("LL"),
            }}
            onClose={closeProductDrawer}
            selectedKeys={{
              name: "Name",
              costPrice: "Cost Price",
              type: "Type of Product",
              sellingPrice: "Selling Price",
              createdAt: "Created At",
              description: "Description",
              um: "Unit",
            }}
          />
        ) : null}
        <AlertModal
          confirmDisable={deleting}
          body={"Do you want to delete the product ?"}
          header={"Delete product"}
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
