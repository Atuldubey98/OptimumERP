import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Spinner,
  Stack,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import instance from "../../../instance";

export default function HistoryDrawer({ isOpen, onClose }) {
  const { orgId, type, id } = useParams();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/${type}/${id}/activities`
      );
      setActivities(data.data || []);
    } catch (error) {
      console.error("Failed to fetch activities", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActivities();
    }
  }, [isOpen]);

  const stepTitleColor = useColorModeValue("gray.700", "white");
  const stepDescColor = useColorModeValue("gray.500", "gray.400");

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">Activity History</DrawerHeader>

        <DrawerBody>
          {isLoading ? (
            <Flex justify="center" align="center" h="100%">
              <Spinner />
            </Flex>
          ) : activities.length === 0 ? (
            <Flex justify="center" align="center" h="100%">
              <Text color="gray.500">No activities found</Text>
            </Flex>
          ) : (
            <Box py={4}>
              <Stepper
                index={activities.length}
                orientation="vertical"
                height="auto"
                gap="0"
              >
                {activities.map((activity, index) => (
                  <Step key={activity._id}>
                    <StepIndicator>
                      <StepStatus
                        complete={<StepIcon />}
                        incomplete={<StepNumber />}
                        active={<StepNumber />}
                      />
                    </StepIndicator>

                    <Box flexShrink="0" mb={8} ml={4}>
                      <StepTitle>
                        <Text fontWeight="bold" color={stepTitleColor}>
                          {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                        </Text>
                      </StepTitle>
                      <StepDescription>
                        <Stack spacing={1}>
                          <Text color={stepDescColor} fontSize="sm">
                            {activity.message}
                          </Text>
                          <Text fontSize="xs" color="gray.400">
                            {moment(activity.at).format("LLL")}
                          </Text>
                        </Stack>
                      </StepDescription>
                    </Box>

                    <StepSeparator />
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
