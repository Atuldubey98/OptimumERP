import React from "react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Grid,
  GridItem,
  Stack,
  Text,
} from "@chakra-ui/react";
export default function ShowDrawer({
  isOpen,
  onClose,
  formBtnLabel,
  item,
  selectedKeys,
  heading,
  onClickNewItem,
  disable,
}) {
  const getFieldsToShow = () => {
    const fields = [];
    Object.entries(item).forEach(([key, value]) => {
      if (selectedKeys[key]) {
        fields.push({ name: selectedKeys[key], value });
      }
    });
    return fields;
  };
  const fields = getFieldsToShow();
  return (
    <Drawer
      blockScrollOnMount={false}
      size={"md"}
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>{heading}</DrawerHeader>
        <Divider />
        <DrawerBody>
          <Stack spacing={3} marginBlock={3}>
            {fields
              .filter((field) => field.value)
              .map((field) => (
                <Box key={field.name}>
                  <Grid gridTemplateColumns={"auto 1fr"} gap={5}>
                    <GridItem>
                      <Text fontWeight={"bold"}>{field.name} : </Text>
                    </GridItem>
                    <GridItem>{field.value}</GridItem>
                  </Grid>
                </Box>
              ))}
          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Close
          </Button>
          {onClickNewItem ? (
            <Button
              isDisabled={disable}
              onClick={onClickNewItem}
              colorScheme="blue"
            >
              {formBtnLabel}
            </Button>
          ) : null}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
