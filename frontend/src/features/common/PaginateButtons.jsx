import { Flex, Text } from "@chakra-ui/react";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";

export default function PaginateButtons({
  page,
  totalPages,
  nextPage,
  previousPage,
}) {
  return (
    <Flex justifyContent={"center"} gap={5} alignItems={"center"}>
      {page === 1 ? null : (
        <IoIosArrowDropleft
          size={30}
          cursor={"pointer"}
          onClick={previousPage}
        />
      )}
      <Text>{`${page}/${totalPages}`}</Text>
      {page < totalPages ? (
        <IoIosArrowDropright size={30} cursor={"pointer"} onClick={nextPage} />
      ) : null}
    </Flex>
  );
}
