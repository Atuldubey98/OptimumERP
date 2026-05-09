import { 
  VStack, 
  Flex, 
  Spinner, 
  Icon, 
  Text, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  Button,
  useColorModeValue,
  Box
} from "@chakra-ui/react";
import React from "react";
import { FiMessageSquare, FiSearch } from "react-icons/fi";
import ConversationItem from "./ConversationItem";

const ConversationList = ({ 
  chats, 
  loading, 
  loadingMore,
  activeChatId, 
  onChatSelect, 
  searchTerm,
  onSearchChange,
  hasMore,
  onLoadMore
}) => {
  const searchBg = useColorModeValue("gray.50", "whiteAlpha.50");

  return (
    <Flex direction="column" h="100%">
      <Box p={3}>
        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search conversations..."
            bg={searchBg}
            border="none"
            borderRadius="full"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </InputGroup>
      </Box>

      <VStack align="stretch" spacing={0} flex={1} overflowY="auto" p={2}>
        {chats.length === 0 && !loading ? (
          <Flex direction="column" align="center" py={20} opacity={0.6}>
            <Icon as={FiMessageSquare} fontSize="4xl" mb={4} />
            <Text fontSize="sm">No conversations found</Text>
          </Flex>
        ) : (
          <>
            {chats.map((chat) => (
              <ConversationItem
                key={chat._id}
                chat={chat}
                isActive={activeChatId === chat._id}
                onClick={() => onChatSelect(chat._id)}
              />
            ))}
            
            {hasMore && (
              <Flex justify="center" py={4}>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={onLoadMore}
                  isLoading={loadingMore}
                  loadingText="Loading..."
                >
                  Load More
                </Button>
              </Flex>
            )}
          </>
        )}
        
        {loading && !loadingMore && (
          <Flex justify="center" py={10}>
            <Spinner size="md" color="blue.500" />
          </Flex>
        )}
      </VStack>
    </Flex>
  );
};

export default ConversationList;

