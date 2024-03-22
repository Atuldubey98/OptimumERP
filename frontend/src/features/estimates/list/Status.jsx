import { Tag } from "@chakra-ui/react";

export default function Status({ status, statusList }) {
  return (
    <Tag
      textTransform={"capitalize"}
      size={"md"}
      variant={"solid"}
      colorScheme={
        statusList.find((statusItem) => statusItem.value === status)
          .colorScheme || "blue"
      }
    >
      {status}
    </Tag>
  );
}
