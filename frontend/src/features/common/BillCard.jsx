import React from "react";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import Status from "../estimates/list/Status";
import { invoiceStatusList } from "../../constants/invoice";
export default function BillCard({
  billNo,
  partName,
  date,
  amount,
  payment,
  status,
}) {
  return (
    <Card maxW="sm">
      <CardHeader>
        <Heading fontSize={"xl"}>{billNo}</Heading>
        <Text>{partName}</Text>
        <Text>{date}</Text>
      </CardHeader>
      <CardBody>
        <Heading fontSize={"xl"}>Amount</Heading>
        <Heading>{amount}</Heading>
      </CardBody>
      <CardFooter>
        <Flex alignItems={"center"} justifyContent={"flex-end"}>
          <Status status={status} statusList={invoiceStatusList} />
        </Flex>
      </CardFooter>
    </Card>
  );
}
