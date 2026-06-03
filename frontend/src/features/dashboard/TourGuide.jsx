import React from "react";
import {
  Box,
  Heading,
  Stack,
  Text,
  List,
  ListItem,
  ListIcon,
  Flex,
  Icon,
  Badge,
} from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const MotionFlex = motion(Flex);

export default function TourGuide({ icon, label, description, features = [], currentIndex, totalSteps }) {
  return (
    <Box minH={{ base: "auto", md: "360px" }} py={2} px={1}>
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "center", md: "start" }}
        gap={{ base: 6, md: 8 }}
      >
        {/* Left side: Animated Icon container */}
        <MotionFlex
          initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          direction="column"
          align="center"
          justify="center"
          p={6}
          bgGradient="linear(to-br, blue.500, teal.400)"
          borderRadius="2xl"
          boxShadow="0 10px 25px -5px rgba(49, 130, 206, 0.4), 0 8px 10px -6px rgba(49, 130, 206, 0.4)"
          w={{ base: "80px", md: "130px" }}
          h={{ base: "80px", md: "130px" }}
          flexShrink={0}
        >
          <Icon as={icon} w={{ base: 10, md: 16 }} h={{ base: 10, md: 16 }} color="white" />
        </MotionFlex>

        {/* Right side: Tour Content */}
        <Stack spacing={4} flex={1} align="start" w="100%">
          <Badge colorScheme="blue" borderRadius="full" px={3} py={1} fontSize="xs" fontWeight="semibold">
            Step {currentIndex + 1} of {totalSteps}
          </Badge>

          <Heading size="lg" fontWeight="bold" color="gray.800" _dark={{ color: "white" }}>
            {label}
          </Heading>

          <Text fontSize="md" color="gray.600" _dark={{ color: "gray.300" }} lineHeight="tall">
            {description}
          </Text>

          {features && features.length > 0 && (
            <Box w="100%" mt={2}>
              <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" tracking="wider" color="gray.500" _dark={{ color: "gray.400" }} mb={3}>
                Key Capabilities
              </Text>
              <List spacing={3}>
                {features.map((feature, idx) => (
                  <ListItem 
                    key={idx} 
                    fontSize="sm" 
                    color="gray.700" 
                    _dark={{ color: "gray.200" }}
                    display="flex" 
                    alignItems="start"
                  >
                    <ListIcon as={FaCheckCircle} color="teal.500" mt={1} mr={3} />
                    <Text>{feature}</Text>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Stack>
      </Flex>
    </Box>
  );
}
