import { Button, Code, Flex } from "@chakra-ui/react";
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
  return (
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
      <Code borderRadius={"md"}>{`${currentPage} / ${total} `}</Code>
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
