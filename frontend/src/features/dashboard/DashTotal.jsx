import { Highlight, Text } from "@chakra-ui/react";

export default function DashTotal({ dashTotal, dashType }) {
  return (
    <Text padding={2} textAlign={"center"} fontWeight={"bold"}>
      This month |
      <Highlight
        styles={
          dashType === "invoice"
            ? {
                backgroundColor: "lightgreen",
                color: "green",
                border: "1px solid green",
                padding: 1,
                borderRadius: 5,
              }
            : dashType === "quote"
            ? {
                backgroundColor: "lightpink",
                color: "purple",
                border: "1px solid purple",
                padding: 1,
                borderRadius: 5,
              }
            : dashType === "expense"
            ? {
                backgroundColor: "lightblue",
                color: "blue",
                border: "1px solid blue",
                padding: 1,
                borderRadius: 5,
              }
            : dashType === "customer"
            ? {
                backgroundColor: "lightorange",
                color: "orange",
                border: "1px solid orange",
                padding: 1,
                borderRadius: 5,
              }
            : {}
        }
        query={dashTotal}
      >
        {` ${dashTotal}`}
      </Highlight>
    </Text>
  );
}
