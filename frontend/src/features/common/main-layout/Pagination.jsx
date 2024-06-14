import { Button, Code, Flex, Text } from "@chakra-ui/react";
import { createSearchParams, useNavigate } from "react-router-dom";
import useQuery from "../../../hooks/useQuery";

export default function Pagination({ total, currentPage }) {
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
        Previous
      </Button>
      <Text
        fontSize={"sm"}
        borderRadius={"md"}
      >{`Pages ${currentPage} of ${total} `}</Text>
      <Button
        size={"sm"}
        onClick={() => onClick(++currentPage)}
        isDisabled={currentPage >= total}
      >
        Next
      </Button>
    </Flex>
  );
}
