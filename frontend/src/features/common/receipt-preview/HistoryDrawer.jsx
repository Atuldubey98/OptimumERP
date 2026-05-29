import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
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
  const iframeBg = useColorModeValue("white", "#1A202C");
  const iframeBorderColor = useColorModeValue("#E2E8F0", "#4A5568");
  const isDarkMode = useColorModeValue(false, true);

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

                    <Box flex="1" mb={8} ml={4} overflow="hidden">
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
                          {activity.action === "sent" && activity.data && (
                            <Accordion allowToggle mt={2}>
                              <AccordionItem border="1px" borderColor={useColorModeValue("gray.200", "gray.700")} borderRadius="md">
                                <h2>
                                  <AccordionButton py={2} px={3}>
                                    <Box as="span" flex="1" textAlign="left" fontSize="xs" fontWeight="semibold">
                                      View Email Details
                                    </Box>
                                    <AccordionIcon />
                                  </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4} fontSize="xs">
                                  <Stack spacing={2}>
                                    {activity.data.to && (
                                      <Box>
                                        <Text fontWeight="bold" color="gray.500">To:</Text>
                                        <Text color={stepTitleColor}>
                                          {Array.isArray(activity.data.to) ? activity.data.to.join(", ") : activity.data.to}
                                        </Text>
                                      </Box>
                                    )}
                                    {activity.data.cc && activity.data.cc.length > 0 && (
                                      <Box>
                                        <Text fontWeight="bold" color="gray.500">Cc:</Text>
                                        <Text color={stepTitleColor}>
                                          {Array.isArray(activity.data.cc) ? activity.data.cc.join(", ") : activity.data.cc}
                                        </Text>
                                      </Box>
                                    )}
                                    {activity.data.html && (() => {
                                       const styledHtml = isDarkMode
                                         ? `<style>
                                             body { background-color: #1A202C !important; color: #EEEEEE !important; font-family: 'Poppins', sans-serif; }
                                             table { background-color: #1A202C !important; color: #EEEEEE !important; }
                                             td { color: #EEEEEE !important; }
                                             span { color: #EEEEEE !important; }
                                             div { color: #EEEEEE !important; }
                                             p { color: #EEEEEE !important; }
                                             h1, h2, h3, h4, h5, h6 { color: #FFFFFF !important; }
                                             a { color: #4FD1C5 !important; }
                                           </style>` + activity.data.html
                                         : activity.data.html;
                                       return (
                                         <Box>
                                           <Text fontWeight="bold" color="gray.500" mb={1}>Email Body:</Text>
                                           <iframe
                                             title="Email Body Preview"
                                             srcDoc={styledHtml}
                                             sandbox=""
                                             style={{
                                               width: "100%",
                                               height: "200px",
                                               border: "1px solid",
                                               borderColor: iframeBorderColor,
                                               borderRadius: "6px",
                                               background: iframeBg
                                             }}
                                           />
                                         </Box>
                                       );
                                     })()}
                                  </Stack>
                                </AccordionPanel>
                              </AccordionItem>
                            </Accordion>
                          )}
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
