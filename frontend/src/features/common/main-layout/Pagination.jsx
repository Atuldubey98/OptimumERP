import { Button, Flex } from "@chakra-ui/react";
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
  const start = Math.max(0, currentPage - 2);
  const end = Math.min(start + 10, total - 1);
  const paginate = [];
  for (let i = start; i <= end; i++) paginate.push(i);
  return  (
    <Flex
      alignItems={"center"}
      gap={5}
      marginBlock={3}
      flexWrap={"wrap"}
      justifyContent={"center"}
    >
      <Button
        onClick={() => onClick(--currentPage)}
        isDisabled={currentPage === 1}
      >
        Previous
      </Button>
      {paginate.map((page) => {
        return (
          <Button
            isActive={currentPage === page + 1}
            key={page}
            onClick={() => onClick(page + 1)}
            colorScheme="green"
          >
            {page + 1}
          </Button>
        );
      })}
      <Button
        onClick={() => onClick(++currentPage)}
        isDisabled={currentPage === total}
      >
        Next
      </Button>
    </Flex>
  );
}
