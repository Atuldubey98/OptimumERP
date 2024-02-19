import React, { useEffect, useState } from "react";
import MainLayout from "../common/main-layout";
import { Flex, Spinner, useDisclosure } from "@chakra-ui/react";
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
  const { fetchProducts, loading, products, totalCount, totalPages, currentPage } = useProducts();
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
    });
    openProductFormDrawer();
  };
  const onOpenDrawerForEditingProduct = (product) => {
    formik.setValues(product);
    openProductFormDrawer();
  };
  const {orgId = ""} = useParams();
  const {requestAsyncHandler} = useAsyncCall();
  const onDeleteProduct = requestAsyncHandler(async (product) => {
    await deletProduct(product._id, orgId);
    fetchProducts();
  });

  return (
    <MainLayout>
      {loading ? (
        <Flex justifyContent={"center"} alignItems={"center"}>
          <Spinner size={"md"} />
        </Flex>
      ) : null}
      <TableLayout
        heading={"Products"}
        tableData={products}
        caption={`Total products found : ${totalCount}`}
        operations={products.map((product) => (
          <ProductMenu
            onDeleteProduct={onDeleteProduct}
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
          um : "Unit of measurement"
        }}
        onAddNewItem={onOpenDrawerForAddingNewProduct}
      />
      <Pagination total={totalPages} currentPage={currentPage}/>
      {selectedToShowProduct ? (
        <ShowDrawer
          onClickNewItem={onOpenDrawerForAddingNewProduct}
          heading={"Products"}
          formBtnLabel={"Add new product"}
          isOpen={isProductDrawerOpen}
          item={selectedToShowProduct}
          onClose={closeProductDrawer}
          selectedKeys={{
            name: "Name",
            costPrice: "Cost Price",
            category: "Type of Product",
            sellingPrice: "Selling Price",
            createdAt: "Created At",
            description: "Description",
            um : "Unit"
          }}
        />
      ) : null}
      <ProductFormDrawer
        formik={formik}
        isOpen={isProductFormOpen}
        onClose={onCloseProductFormDrawer}
      />
    </MainLayout>
  );
}
