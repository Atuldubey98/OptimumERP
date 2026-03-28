import { Button, Code, Flex, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { createSearchParams, useNavigate } from "react-router-dom";
import useQuery from "../../../hooks/useQuery";

export default function Pagination({ total, currentPage }) {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const query = useQuery();
  const onClick = (pageNumber) => {
    navigate({
      pathname: ``,
      search: createSearchParams({
        query: query.get("query") || "",
        page: pageNumber,
      }).toString(),
    });
  };
  return total === 0 ? null : (
    <Flex
      alignItems={"center"}
      gap={5}
      marginBlock={3}
      flexWrap={"wrap"}
      justifyContent={"center"}
    >
      <Button
        size={"sm"}
        onClick={() => onClick(--currentPage)}
        isDisabled={currentPage === 1}
      >
        {t("common_ui.actions.previous")}
      </Button>
      <Text
        fontSize={"sm"}
        borderRadius={"md"}
      >
        {t("common_ui.pagination.pages_of", { currentPage, total })}
      </Text>
      <Button
        size={"sm"}
        onClick={() => onClick(++currentPage)}
        isDisabled={currentPage >= total}
      >
        {t("common_ui.actions.next")}
      </Button>
    </Flex>
  );
}
