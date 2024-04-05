import { Flex, Image, Text, useColorModeValue } from "@chakra-ui/react";
import React from "react";
export default function Template({
  template,
  onSelectTemplate,
  currentTemplateName,
}) {
  const hoverBg = useColorModeValue("gray.200", "gray.600");

  return (
    <Flex
      p={1}
      justifyContent={"center"}
      alignItems={"center"}
      flexDir={"column"}
      cursor={"pointer"}
      width={60}
      gap={1}
      bg={template.value === currentTemplateName ? hoverBg : undefined}
      key={template.value}
      onClick={() => {
        onSelectTemplate(template);
      }}
    >
      <Image width={20} objectFit={"contain"} src={template.templateImg} />
      <Text fontWeight={600} fontSize={"sm"} textAlign={"center"}>
        {template.label}
      </Text>
    </Flex>
  );
}
