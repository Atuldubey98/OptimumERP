import { Flex, Grid, Image, Text, useColorModeValue } from "@chakra-ui/react";
import React from "react";
export default function Template({
  template,
  onSelectTemplate,
  currentTemplateName,
}) {
  const hoverBg = useColorModeValue("gray.200", "gray.600");

  return (
    <Grid
      alignItems={"center"}
      p={1}
      cursor={"pointer"}
      gap={1}
      bg={template.value === currentTemplateName ? hoverBg : undefined}
      key={template.value}
      onClick={() => {
        onSelectTemplate(template);
      }}
    >
      <Image m={"auto"} width={20} objectFit={"contain"} src={template.templateImg} />
      <Text fontWeight={600} fontSize={"sm"} textAlign={"center"}>
        {template.label}
      </Text>
    </Grid>
  );
}
