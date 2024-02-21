import {
    Box,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Spinner,
} from "@chakra-ui/react";

export default function SelectCustomer() {
//   const options = [
//     { value: "S R Refrigeration and Electricals", label: "DS Group" },
//     { value: "S R Refrigeration and Electricals", label: "DS Group" },
//     { value: "S R Refrigeration and Electricals", label: "DS Group" },
//     { value: "S R Refrigeration and Electricals", label: "DS Group" },
//     { value: "S R Refrigeration and Electricals", label: "DS Group" },
//     { value: "S R Refrigeration and Electricals", label: "DS Group" },
//     { value: "S R Refrigeration and Electricals", label: "DS Group" },
//     { value: "S R Refrigeration and Electricals", label: "DS Group" },
//   ];
  return (
    <Box position={"relative"}>
      <FormControl>
        <FormLabel>Client name</FormLabel>
        <InputGroup>
          <Input placeholder="Search for customer" />
          <InputRightElement>
            <Spinner color="green.500" />
          </InputRightElement>
        </InputGroup>
      </FormControl>
      {/* <Box position={"absolute"} width={"100%"} bg={"white"} zIndex={2}>
        <SelectList options={options} />
      </Box> */}
    </Box>
  );
}
