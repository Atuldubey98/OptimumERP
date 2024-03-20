import {
  Divider,
  Flex,
  Grid,
  Hide,
  List,
  ListIcon,
  ListItem,
  Show,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { MdCheckCircle } from "react-icons/md";

import Banner from "../sidebar/Banner";
export default function AuthLayout({ children, formHeading }) {
  const {colorMode} = useColorMode();
  
   return (
    <Flex justifyContent={"center"} alignItems={"center"} height={"100svh"}>
      <Hide below="md">
        <Flex
          height={"100%"}
          flex={"1"}
          backgroundColor={colorMode === "dark" ? undefined :  "#EAEFFB"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Grid gap={4}>
            <Banner />
            <Grid marginBlock={3}>
              <Text fontSize={"xl"} color={"GrayText"}>
                Manage your company with :
              </Text>
              <List marginBlock={3} spacing={3}>
                <ListItem>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  All in one tool
                </ListItem>
                <ListItem>
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  It Brings Together Your Invoice, Clients And Estimates
                </ListItem>
              </List>
            </Grid>
            <Divider />
          </Grid>
        </Flex>
      </Hide>
      <Flex
        height={"100%"}
        flex={1}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Grid padding={4} width={"100%"} maxWidth={550} gap={4}>
          <Show below="md">
            <Banner />
          </Show>
          <Text fontSize={"xl"} fontWeight={"600"}>
            {formHeading}
          </Text>
          <Divider />
          {children}
        </Grid>
      </Flex>
    </Flex>
  );
}
