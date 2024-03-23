import React, { useEffect, useState } from "react";
import MainLayout from "../common/main-layout";
import {
  Box,
  Flex,
  Spinner,
  Tag,
  TagLabel,
  TagLeftIcon,
  useDisclosure,
} from "@chakra-ui/react";
import useProducts from "../../hooks/useProducts";
import ProductMenu from "./ProductMenu";
import TableLayout from "../common/table-layout";
import ShowDrawer from "../common/ShowDrawer";
import useQuery from "../../hooks/useQuery";
import useProductForm from "../../hooks/useProductForm";
import ProductFormDrawer from "./ProductFormDrawer";
import { deletProduct } from "../../api/product";
import { useParams } from "react-router-dom";
import useAsyncCall from "../../hooks/useAsyncCall";
import Pagination from "../common/main-layout/Pagination";
import SearchItem from "../common/table-layout/SearchItem";
import AlertModal from "../common/AlertModal";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import { MdOutlineHomeRepairService } from "react-icons/md";
import { CgProductHunt } from "react-icons/cg";
import { ums } from "../estimates/create/data";
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
  } = useProducts();
  useEffect(() => {
    fetchProducts();
  }, [search, fetchProducts]);
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
      category: "service",
      code: "",
      um: "none",
    });
    openProductFormDrawer();
  };
  const onOpenDrawerForEditingProduct = (product) => {
    formik.setValues(product);
    openProductFormDrawer();
  };
  const { orgId = "" } = useParams();
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
    await deletProduct(selectedToShowProduct._id, orgId);
    fetchProducts();
    closeDeleteModal();
    setProductStatus("idle");
  });
  const { symbol } = useCurrentOrgCurrency();
  const productsMapper = (product) => ({
    ...product,
    um: ums.find((um) => um.value === product.um).label || "Nos",
    costPrice: `${symbol} ${product.costPrice}`,
    category: (
      <Tag
        textTransform={"capitalize"}
        size={"md"}
        variant={"solid"}
        colorScheme={"blue"}
      >
        <TagLeftIcon
          boxSize="12px"
          as={
            product.category === "service"
              ? MdOutlineHomeRepairService
              : CgProductHunt
          }
        />
        <TagLabel>{product.category}</TagLabel>
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
            filter={
              <Box maxW={"md"}>
                <SearchItem />
              </Box>
            }
            heading={"Items"}
            tableData={products.map(productsMapper)}
            caption={`Total products found : ${totalCount}`}
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
              category: "Type of Product",
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
            onClickNewItem={onOpenDrawerForAddingNewProduct}
            heading={"Products"}
            formBtnLabel={"Add new product"}
            isOpen={isProductDrawerOpen}
            item={{
              ...selectedToShowProduct,
              createdAt: new Date(
                selectedToShowProduct.createdAt
              ).toDateString(),
            }}
            onClose={closeProductDrawer}
            selectedKeys={{
              name: "Name",
              costPrice: "Cost Price",
              category: "Type of Product",
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
