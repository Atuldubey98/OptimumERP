import {
  Box,
  Flex,
  HStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { reportTypes } from "../../constants/reports";

export default function ReportNavPills() {
  const { reportType: currentTab, orgId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("report");

  const containerBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const containerBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const activeBg = "indigo.500";
  const activeColor = "white";
  const inactiveBg = useColorModeValue("white", "whiteAlpha.100");
  const inactiveColor = useColorModeValue("gray.700", "gray.300");
  const inactiveBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const hoverBg = useColorModeValue("indigo.50", "whiteAlpha.200");
  const hoverBorder = useColorModeValue("indigo.300", "indigo.400");
  const labelColor = useColorModeValue("gray.500", "gray.400");

  return (
    <Box
      width="100%"
      bg={containerBg}
      border="1px solid"
      borderColor={containerBorder}
      borderRadius="xl"
      p={2}
      mb={3}
    >
      <Flex
        alignItems="center"
        gap={4}
        overflowX="auto"
        whiteSpace="nowrap"
        py={1}
        px={1}
        sx={{
          "&::-webkit-scrollbar": { display: "none" },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {reportTypes.map((group, groupIndex) => (
          <Flex key={group.type} alignItems="center" gap={2} flexShrink={0}>
            {groupIndex > 0 && (
              <Box
                h="20px"
                w="1px"
                bg={containerBorder}
                mx={1}
                flexShrink={0}
              />
            )}
            <Text
              fontSize="xs"
              fontWeight="bold"
              color={labelColor}
              textTransform="uppercase"
              letterSpacing="wider"
              px={1}
              flexShrink={0}
            >
              {t(group.type)}:
            </Text>
            <HStack spacing={2} flexShrink={0}>
              {group.children.map((child) => {
                const isActive = currentTab === child.tab;
                return (
                  <Box
                    as="button"
                    key={child.tab}
                    onClick={() => navigate(`/${orgId}/reports/${child.tab}`)}
                    px={3.5}
                    py={1.5}
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight={isActive ? "semibold" : "medium"}
                    bg={isActive ? activeBg : inactiveBg}
                    color={isActive ? activeColor : inactiveColor}
                    border="1px solid"
                    borderColor={isActive ? activeBg : inactiveBorder}
                    boxShadow={isActive ? "sm" : "none"}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={
                      isActive
                        ? { bg: "indigo.600" }
                        : { bg: hoverBg, borderColor: hoverBorder }
                    }
                    _focus={{ outline: "none" }}
                    flexShrink={0}
                  >
                    {t(child.label)}
                  </Box>
                );
              })}
            </HStack>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}
