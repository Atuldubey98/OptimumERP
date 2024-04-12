import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  Text,
} from "@chakra-ui/react";
import React from "react";

export default function CardWrapper({ title, subtitle, children, footer }) {
  return (
    <Card w={"100%"}>
      <CardHeader>
        <Heading fontSize={"xl"}>{title}</Heading>
        <Text fontSize={"sm"}>{subtitle}</Text>
      </CardHeader>
      <CardBody>{children}</CardBody>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
