import {
  Box,
  Button,
  Heading,
  List,
  ListIcon,
  ListItem,
  Stack,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { FaRegCircle } from "react-icons/fa6";
import { MdCheckCircle } from "react-icons/md";
import AuthContext from "../../contexts/AuthContext";

export default function PricingCard({ plan, planOfferings, price }) {
  const auth = useContext(AuthContext);
  const currentPlan = auth?.user?.currentPlan
    ? auth?.user?.currentPlan.plan
    : "free";
  return (
    <Box maxW={"sm"} border={"1px solid lightgray"} borderRadius={"md"}>
      <Box p={3} borderBottom={"1px solid lightgray"}>
        <Heading textTransform={"capitalize"} fontSize={"md"}>
          {plan}
        </Heading>
      </Box>
      <Stack spacing={3} p={5}>
        <Heading>{price}</Heading>
        <List spacing={3}>
          {planOfferings.map((planOffering) => (
            <ListItem>
              <ListIcon
                as={
                  planOffering.valid.includes(plan)
                    ? MdCheckCircle
                    : FaRegCircle
                }
                color="green.500"
              />
              {planOffering.value}
            </ListItem>
          ))}
        </List>
        <Button
          as={"a"}
          href={`mailto:optimum.erp2024@gmail.com?subject=Upgrade to ${plan}&body=Please write down your business name, business address and reason for upgrading your plan`}
          title={plan === "platinum" && "Coming soon"}
          isDisabled={currentPlan === plan || plan === "platinum"}
        >
          {currentPlan === plan ? "Active" : "Upgrade"}
        </Button>
      </Stack>
    </Box>
  );
}
