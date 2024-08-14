import { Box, Flex, Heading, Spinner } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { HiOutlineNewspaper } from "react-icons/hi";
import { useParams } from "react-router-dom";
import instance from "../../../instance";
import MainLayout from "../main-layout";
import ReceiptDisplay from "./ReceiptDisplay";
import useReceipt from "../../../hooks/useReceipt";
import receiptMetas from "../../../constants/receiptMetas";

function InvalidReceipt({ heading }) {
  return (
    <Flex
      minH={"50svh"}
      gap={3}
      justifyContent={"center"}
      alignItems={"center"}
      flexDir={"column"}
    >
      <HiOutlineNewspaper size={80} color="lightgray" />
      <Heading color={"gray.300"} fontSize={"2xl"}>
        {heading}
      </Heading>
    </Flex>
  );
}

function ReceiptLoader() {
  return (
    <Flex justifyContent={"center"} alignItems={"center"}>
      <Spinner />
    </Flex>
  );
}

export default function ReceiptPreview() {
  const { type } = useParams();
  const currentReceiptMeta = receiptMetas[type];
  const { receipt, isReceiptNotFound, isLoading } = useReceipt();
  return (
    <MainLayout>
      <Box p={4}>
        {isLoading ? (
          <ReceiptLoader />
        ) : currentReceiptMeta ? (
          <Flex justifyContent={"center"} alignItems={"center"}>
            {isReceiptNotFound ? (
              <InvalidReceipt heading={"Not found"} />
            ) : receipt ? (
              <ReceiptDisplay receipt={receipt} meta={currentReceiptMeta} />
            ) : null}
          </Flex>
        ) : (
          <InvalidReceipt heading={"Invalid Type"} />
        )}
      </Box>
    </MainLayout>
  );
}
