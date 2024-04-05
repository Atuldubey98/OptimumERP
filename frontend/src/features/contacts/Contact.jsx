import {
  Avatar,
  Box,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Flex,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin2Line } from "react-icons/ri";
import { contactTypes } from "../../constants/contactTypes";
export default function Contact({ item, onDeleteContact, onEditContact }) {
  return (
    <Card maxW={"md"} key={item._id}>
      <CardHeader>
        <Flex justifyContent={"flex-start"} gap={3} alignItems={"center"}>
          <Avatar size={"sm"} name={item.name} />
          <Box>
            <Text fontSize={"xl"} fontWeight={"bold"}>
              {item.name}
            </Text>
            <Text>{item.telephone}</Text>
          </Box>
        </Flex>
      </CardHeader>
      <Divider />
      <CardBody>
        <Text>
          <strong>Email : </strong>
          {item.email || "Email Not known"}
        </Text>
        <Text>{item.party ? item.party.name : "Unkown party"}</Text>
        <Text>
          {contactTypes.find((contactType) => contactType.value === item.type)
            .label || "Unknown Type"}
        </Text>
      </CardBody>
      <CardFooter>
        <ButtonGroup justifyContent={"flex-end"} alignItems={"center"}>
          <IconButton icon={<CiEdit />} onClick={onEditContact} />
          <IconButton
            icon={<RiDeleteBin2Line color="red" />}
            onClick={onDeleteContact}
          />
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
