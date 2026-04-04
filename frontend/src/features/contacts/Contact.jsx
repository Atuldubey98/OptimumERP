import {
  Avatar,
  Badge,
  Box,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  HStack,
  Link,
  IconButton,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { CiEdit } from "react-icons/ci";
import { Link as RouterLink, useParams } from "react-router-dom";
import { RiDeleteBin2Line } from "react-icons/ri";
export default function Contact({ item, onDeleteContact, onEditContact }) {
  const { orgId } = useParams();
  const { t } = useTranslation("contact");
  const subtleTextColor = useColorModeValue("gray.500", "gray.400");
  const surfaceBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Card key={item._id} borderRadius="2xl" h="100%">
      <CardHeader>
        <Flex justifyContent="space-between" gap={4} alignItems="flex-start">
          <HStack spacing={3} align="flex-start">
            <Avatar size="md" name={item.name} />
            <Box>
              <Text noOfLines={1} fontSize="lg" fontWeight="semibold">
                {item.name}
              </Text>
              <Link noOfLines={1} href={`tel:${item.telephone}`} color={subtleTextColor}>
                {item.telephone}
              </Link>
            </Box>
          </HStack>
          <Badge borderRadius="full" px={3} py={1} bg={surfaceBg} textTransform="none">
            {item.type}
          </Badge>
        </Flex>
      </CardHeader>
      <CardBody pt={0} fontSize="sm">
        <Stack spacing={4}>
          <Box>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={subtleTextColor}>
              {t("contact_ui.card.email")}
            </Text>
            {item.email ? (
              <Link href={`mailto:${item.email}`}>{item.email}</Link>
            ) : (
              <Text color={subtleTextColor}>{t("contact_ui.card.not_set")}</Text>
            )}
          </Box>
          <Box>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={subtleTextColor}>
              {t("contact_ui.card.company_name")}
            </Text>
            {item.party ? (
              <Link
                as={RouterLink}
                to={`/${orgId}/parties/${item.party._id}/transactions`}
                noOfLines={1}
              >
                {item.party.name}
              </Link>
            ) : (
              <Text color={subtleTextColor}>{t("contact_ui.card.not_set")}</Text>
            )}
          </Box>
        </Stack>
      </CardBody>
      <CardFooter>
        <ButtonGroup justifyContent="flex-end" alignItems="center" ml="auto">
          <IconButton
            isRound
            size="sm"
            icon={<CiEdit />}
            aria-label={t("contact_ui.actions.edit")}
            onClick={onEditContact}
          />
          <IconButton
            size="sm"
            isRound
            icon={<RiDeleteBin2Line color="red" />}
            aria-label={t("contact_ui.actions.delete")}
            onClick={onDeleteContact}
          />
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
