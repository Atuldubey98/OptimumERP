import React, { memo } from "react";
import { Text, Box, TableContainer, Table, Thead, Th, Td, Divider, VStack, Flex } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { baseURL } from "../../instance";

const MarkdownRenderer = memo(({ content }) => {
  const MarkdownComponents = {
    p: ({ children }) => <Box as="div" mb={3} fontSize="13px" lineHeight="1.6">{children}</Box>,
    ul: ({ children }) => <Box as="ul" pl={5} mb={3} style={{ listStyleType: "disc" }}>{children}</Box>,
    ol: ({ children }) => <Box as="ol" pl={5} mb={3} style={{ listStyleType: "decimal" }}>{children}</Box>,
    li: ({ children }) => <Box as="li" fontSize="13px" mb={1} pl={1}>{children}</Box>,
    strong: ({ children }) => <Text as="span" fontWeight="700" color="blue.300" _light={{ color: "blue.600" }}>{children}</Text>,
    h3: ({ children }) => <Text fontSize="14px" fontWeight="bold" mt={4} mb={2} color="whiteAlpha.900" _light={{ color: "gray.800" }}>{children}</Text>,
    a: ({ children, href }) => {
      const isDownload = href.includes("/download");
      const fullHref = isDownload && !href.startsWith("http") ? `${baseURL}${href}` : href;
      if (isDownload) {
        return (
          <Text as="span" fontWeight="600">
            {children}
          </Text>
        );
      }
      return (
        <Text
          as="a"
          href={fullHref}
          color="blue.400"
          fontWeight="600"
          textDecoration="underline"
          textUnderlineOffset="2px"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ color: "blue.300", opacity: 0.8 }}
          _light={{ color: "blue.600", _hover: { color: "blue.700" } }}
        >
          {children}
        </Text>
      );
    },
    table: ({ children }) => {
      // 1. Extract text recursively
      const extractText = (node) => {
        if (!node) return "";
        if (typeof node === "string" || typeof node === "number") return String(node);
        if (Array.isArray(node)) return node.map(extractText).join("");
        if (node.props && node.props.children) return extractText(node.props.children);
        return "";
      };

      // 2. Parse headers and rows
      let headers = [];
      let rows = [];

      React.Children.forEach(children, (child) => {
        if (!child) return;
        const typeStr = typeof child.type === "string" ? child.type.toLowerCase() : (child.type?.name || "").toLowerCase();
        if (typeStr === "thead" || child.props?.mdType === "thead") {
          React.Children.forEach(child.props.children, (tr) => {
            if (!tr) return;
            React.Children.forEach(tr.props.children, (th) => {
              if (!th) return;
              headers.push(extractText(th.props.children));
            });
          });
        } else if (typeStr === "tbody" || child.props?.mdType === "tbody") {
          React.Children.forEach(child.props.children, (tr) => {
            if (!tr) return;
            let row = [];
            React.Children.forEach(tr.props.children, (td) => {
              if (!td) return;
              row.push(td.props.children);
            });
            rows.push(row);
          });
        }
      });

      // 3. Fallback: if parsing fails or table is empty, render a standard table
      if (headers.length === 0 || rows.length === 0) {
        return (
          <TableContainer 
            my={3} 
            maxW="100%" 
            borderRadius="md" 
            borderWidth="1px" 
            borderColor="whiteAlpha.200" 
            _light={{ borderColor: "gray.200" }} 
            overflowX="auto"
            css={{
              "&::-webkit-scrollbar": { height: "4px" },
              "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.1)", borderRadius: "2px" },
              "&::-webkit-scrollbar-track": { background: "transparent" }
            }}
          >
            <Table variant="simple" size="sm">{children}</Table>
          </TableContainer>
        );
      }

      // 4. Helper for status styling
      const getStatusColors = (status) => {
        const s = extractText(status).toLowerCase();
        if (s.includes('paid') || s.includes('active') || s.includes('approve') || s.includes('success')) {
          return {
            bg: "rgba(72, 187, 120, 0.15)",
            color: "green.300",
            _light: { bg: "green.50", color: "green.700" }
          };
        }
        if (s.includes('sent') || s.includes('pending')) {
          return {
            bg: "rgba(66, 153, 225, 0.15)",
            color: "blue.300",
            _light: { bg: "blue.50", color: "blue.700" }
          };
        }
        if (s.includes('draft') || s.includes('inactive')) {
          return {
            bg: "rgba(160, 174, 192, 0.15)",
            color: "gray.300",
            _light: { bg: "gray.50", color: "gray.700" }
          };
        }
        if (s.includes('unpaid') || s.includes('overdue') || s.includes('fail') || s.includes('cancel') || s.includes('deleting')) {
          return {
            bg: "rgba(245, 101, 101, 0.15)",
            color: "red.300",
            _light: { bg: "red.50", color: "red.700" }
          };
        }
        return {
          bg: "rgba(255, 255, 255, 0.08)",
          color: "whiteAlpha.800",
          _light: { bg: "gray.100", color: "gray.800" }
        };
      };

      // 5. Render Scrollable Card List
      return (
        <VStack spacing={3} my={3} align="stretch" width="100%">
          {rows.map((row, rowIndex) => {
            const titleVal = row[0];
            const statusValIndex = headers.findIndex(h => {
              const lower = String(h).toLowerCase();
              return lower.includes('status') || lower.includes('state');
            });
            const statusVal = statusValIndex !== -1 ? row[statusValIndex] : null;

            return (
              <Box
                key={rowIndex}
                p={3}
                borderRadius="lg"
                bg="whiteAlpha.100"
                _light={{ bg: "gray.50", borderColor: "gray.200" }}
                borderWidth="1px"
                borderColor="whiteAlpha.200"
                boxShadow="sm"
                position="relative"
                transition="all 0.2s"
                _hover={{ transform: "translateY(-1px)", bg: "whiteAlpha.150" }}
              >
                {/* Header Row */}
                <Flex justify="space-between" align="center" mb={2.5}>
                  <Text fontWeight="700" fontSize="12px" color="blue.300" _light={{ color: "blue.600" }}>
                    {headers[0]}: {titleVal}
                  </Text>
                  {statusVal && (
                    <Box
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      fontSize="9px"
                      fontWeight="bold"
                      {...getStatusColors(statusVal)}
                    >
                      {extractText(statusVal)}
                    </Box>
                  )}
                </Flex>

                {/* Grid attributes */}
                <VStack align="stretch" spacing={1.5}>
                  {headers.map((header, colIndex) => {
                    if (colIndex === 0 || colIndex === statusValIndex) return null;
                    const value = row[colIndex];
                    if (value === undefined || value === null) return null;

                    return (
                      <Flex key={colIndex} justify="space-between" fontSize="11px" align="center">
                        <Text color="whiteAlpha.600" _light={{ color: "gray.500" }} fontWeight="500">
                          {header}
                        </Text>
                        <Box color="whiteAlpha.900" _light={{ color: "gray.800" }} fontWeight="600" textAlign="right">
                          {value}
                        </Box>
                      </Flex>
                    );
                  })}
                </VStack>
              </Box>
            );
          })}
        </VStack>
      );
    },
    thead: ({ children }) => <Thead bg="whiteAlpha.100" _light={{ bg: "gray.50" }}>{children}</Thead>,
    th: ({ children }) => <Th color="whiteAlpha.700" _light={{ color: "gray.600" }} textTransform="none" fontSize="10px" py={2} px={2} wordBreak="break-word" whiteSpace="normal">{children}</Th>,
    td: ({ children }) => <Td fontSize="11px" py={2} px={2} color="whiteAlpha.800" _light={{ color: "gray.700" }} wordBreak="break-word" whiteSpace="normal">{children}</Td>,
    hr: () => <Divider my={4} borderColor="whiteAlpha.300" />,
    pre: ({ children }) => (
      <Box 
        as="pre" 
        p={3} 
        my={3} 
        borderRadius="md" 
        bg="blackAlpha.400" 
        _light={{ bg: "gray.800", color: "gray.100" }} 
        overflowX="auto" 
        fontSize="12px"
        width="100%"
        css={{
          "&::-webkit-scrollbar": { height: "4px" },
          "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.2)", borderRadius: "2px" },
          "&::-webkit-scrollbar-track": { background: "transparent" }
        }}
      >
        {children}
      </Box>
    ),
    code: ({ inline, children }) => {
      if (inline) {
        return (
          <Box 
            as="code" 
            px={1.5} 
            py={0.5} 
            borderRadius="sm" 
            bg="whiteAlpha.200" 
            fontSize="12px" 
            _light={{ bg: "gray.100", color: "red.600" }}
          >
            {children}
          </Box>
        );
      }
      return <Box as="code" display="block">{children}</Box>;
    },
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
      {content}
    </ReactMarkdown>
  );
});

export default MarkdownRenderer;
