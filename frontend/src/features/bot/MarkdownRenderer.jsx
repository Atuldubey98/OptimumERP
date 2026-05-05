import React, { memo } from "react";
import { Text, Box, TableContainer, Table, Thead, Th, Td, Divider, Button, HStack } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiDownload, FiFileText } from "react-icons/fi";
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
          <HStack 
            as="a" 
            href={fullHref} 
            download 
            target="_blank"
            rel="noopener noreferrer"
            display="inline-flex"
            px={3}
            py={1.5}
            bg="whiteAlpha.200"
            borderRadius="full"
            _hover={{ bg: "whiteAlpha.300", transform: "translateY(-1px)" }}
            _light={{ 
              bg: "gray.100", 
              _hover: { bg: "gray.200" },
              color: "gray.700"
            }}
            cursor="pointer"
            transition="all 0.2s"
            my={1}
            maxW="100%"
            verticalAlign="middle"
          >
            <FiFileText size={12} color="currentColor" />
            <Text fontSize="11px" fontWeight="medium" noOfLines={1} isTruncated>
              {children}
            </Text>
          </HStack>
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
    table: ({ children }) => (
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
    ),
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
