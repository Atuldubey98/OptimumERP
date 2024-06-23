import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import HelpPopover from "../common/HelpPopover";

export default function CurrentOrgDetailsForm({
  handleChange,
  handleSubmit,
  currentSelectedOrganization,
  isSubmitting,
}) {
  const bg = useColorModeValue("gray.100", "gray.700");
  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Box p={3} bg={bg}>
          <Heading fontSize={"lg"}>Current Organization Details </Heading>
        </Box>
        <Box>
          <Flex justifyContent={"space-between"} alignItems={"center"}>
            <HelpPopover
              title={"Organization"}
              description={
                "It collects essential information about an organization, including its name, address, PAN number and other details"
              }
            />
            <Button
              size={"sm"}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="blue"
            >
              Save
            </Button>
          </Flex>
          <SimpleGrid gap={3} minChildWidth={300}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                onChange={handleChange}
                name="name"
                value={currentSelectedOrganization.name}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Address</FormLabel>
              <Input
                onChange={handleChange}
                name="address"
                value={currentSelectedOrganization.address}
              />
            </FormControl>
            <FormControl>
              <FormLabel>GST No</FormLabel>
              <Input
                onChange={handleChange}
                name="gstNo"
                value={currentSelectedOrganization.gstNo}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>PAN No</FormLabel>
              <Input
                onChange={handleChange}
                name="panNo"
                value={currentSelectedOrganization.panNo}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Website</FormLabel>
              <Input
                type="url"
                onChange={handleChange}
                name="web"
                value={currentSelectedOrganization.web}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Telephone</FormLabel>
              <Input
                type="tel"
                onChange={handleChange}
                name="telephone"
                value={currentSelectedOrganization.telephone}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                onChange={handleChange}
                name="email"
                value={currentSelectedOrganization.email}
              />
            </FormControl>
          </SimpleGrid>
        </Box>
      </Stack>
    </form>
  );
}
