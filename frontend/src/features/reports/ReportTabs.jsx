import { Box, Text, useColorModeValue } from "@chakra-ui/react";
import { reportTypes } from "../../constants/reports";
import { useNavigate, useParams } from "react-router-dom";

export default function ReportTabs({ onClose }) {
  const hoverBg = useColorModeValue("gray.200", "gray.700");
  const selectedBg = useColorModeValue("gray.300", "gray.600");
  const { reportType: tab, orgId } = useParams();
  const navigate = useNavigate();

  return (
    <Box fontSize={"lg"} width={"100%"}>
      {reportTypes.map((reportType) => (
        <Box key={reportType.type}>
          <Box fontWeight={"bold"} p={3} color={"gray"}>
            <Text>{reportType.type}</Text>
          </Box>
          <Box>
            {reportType.children.map((reportTypeChild) => (
              <Box
                onClick={() => {
                  navigate(`/${orgId}/reports/${reportTypeChild.tab}`);
                  if (onClose) onClose();
                }}
                bg={tab === reportTypeChild.tab ? selectedBg : undefined}
                cursor={"pointer"}
                p={3}
                key={reportTypeChild.tab}
              >
                <Text>{reportTypeChild.label}</Text>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
