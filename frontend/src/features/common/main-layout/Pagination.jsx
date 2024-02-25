import { Button, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function Pagination({ total, currentPage }) {
  const navigate = useNavigate();
  const onClick = (pageNumber) => {
    navigate(`?page=${pageNumber}`);
  };
  return (
    <Flex
      alignItems={"center"}
      gap={5}
      flexWrap={"wrap"}
      justifyContent={"center"}
    >
      {new Array(total).fill(0).map((_, page) => {
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
    </Flex>
  );
}
