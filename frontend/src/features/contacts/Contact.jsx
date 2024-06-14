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
  Link,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { CiEdit } from "react-icons/ci";
import { Link as RouterLink, useParams } from "react-router-dom";
import { RiDeleteBin2Line } from "react-icons/ri";
import { contactTypes } from "../../constants/contactTypes";
export default function Contact({ item, onDeleteContact, onEditContact }) {
  const { orgId } = useParams();
  return (
    <Card key={item._id}>
      <CardHeader>
        <Flex justifyContent={"flex-start"} gap={3} alignItems={"center"}>
          <Avatar size={"sm"} name={item.name} />
          <Box>
            <Text noOfLines={1} fontSize={"md"} fontWeight={"bold"}>
              {item.name}
            </Text>
            <Link noOfLines={1} href={`tel:${item.telephone}`}>{item.telephone}</Link>
          </Box>
        </Flex>
      </CardHeader>
      <Divider />
      <CardBody fontSize={"sm"}>
        <Text>
          <strong>Email : </strong>
          {item.email ? (
            <Link href={`mailto:${item.email}`}>{item.email}</Link>
          ) : (
            "-Not-set-"
          )}
        </Text>
        <Text noOfLines={1}>
          <strong>Company Name :</strong>{" "}
          {item.party ? (
            <Link
              as={RouterLink}
              to={`/${orgId}/parties/${item.party._id}/transactions`}
            >
              {item.party.name}
            </Link>
          ) : (
            "-Not-set-"
          )}
        </Text>
        <Text noOfLines={1}>
          {contactTypes.find((contactType) => contactType.value === item.type)
            .label || "Unknown Type"}
        </Text>
      </CardBody>
      <CardFooter>
        <ButtonGroup justifyContent={"flex-end"} alignItems={"center"}>
          <IconButton isRound size={"sm"} icon={<CiEdit />} onClick={onEditContact} />
          <IconButton
            size={"sm"}
            isRound
            icon={<RiDeleteBin2Line color="red" />}
            onClick={onDeleteContact}
          />
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
