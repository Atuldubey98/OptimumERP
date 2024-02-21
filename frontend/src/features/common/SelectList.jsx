import { Box, Text } from "@chakra-ui/react";
import { useState } from "react";

export default function SelectList({ options }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const Option = ({ option, index }) => {
    return (
      <Box
        cursor={"pointer"}
        bg={selectedOption === index ? "lightgray" : undefined}
        onMouseOver={() => setSelectedOption(index)}
        p={2}
        key={option.value}
      >
        <Text>{option.label}</Text>
      </Box>
    );
  };
  return (
    <Box maxH={300} overflowY={"auto"} bg={"white"}>
      {options.map((option, index) => (
        <Option option={option} key={index} index={index} />
      ))}
    </Box>
  );
}
