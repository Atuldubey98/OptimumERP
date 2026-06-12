import {
  Box,
  Flex,
  Heading,
  useColorModeValue,
  useBreakpointValue,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import React, { useEffect, useReducer, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import instance from "../../instance";
import moment from "moment";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

const initialState = {
  chats: [],
  currentChat: null,
  loadingChats: true,
  loadingMore: false,
  loadingMessages: false,
  searchTerm: "",
  page: 1,
  hasMore: false,
  isDeleteOpen: false,
  deletingChatId: null,
  isDeleting: false,
};

function conversationReducer(state, action) {
  switch (action.type) {
    case "SET_SEARCH_TERM":
      return {
        ...state,
        searchTerm: action.payload,
        page: 1,
      };
    case "FETCH_CHATS_START":
      return {
        ...state,
        loadingChats: !action.payload.isLoadMore,
        loadingMore: action.payload.isLoadMore,
      };
    case "FETCH_CHATS_SUCCESS":
      return {
        ...state,
        chats: action.payload.isLoadMore
          ? [...state.chats, ...action.payload.chats]
          : action.payload.chats,
        page: action.payload.page,
        hasMore: action.payload.hasMore,
        loadingChats: false,
        loadingMore: false,
      };
    case "FETCH_CHATS_FAILURE":
      return {
        ...state,
        loadingChats: false,
        loadingMore: false,
      };
    case "FETCH_MESSAGES_START":
      return {
        ...state,
        loadingMessages: true,
      };
    case "FETCH_MESSAGES_SUCCESS":
      return {
        ...state,
        currentChat: action.payload,
        loadingMessages: false,
      };
    case "FETCH_MESSAGES_FAILURE":
      return {
        ...state,
        loadingMessages: false,
      };
    case "SET_CURRENT_CHAT_NULL":
      return {
        ...state,
        currentChat: null,
      };
    case "DELETE_CHAT_SUCCESS":
      return {
        ...state,
        chats: state.chats.filter((c) => c._id !== action.payload),
        currentChat: state.currentChat?._id === action.payload ? null : state.currentChat,
        isDeleting: false,
      };
    case "DELETE_CHAT_START":
      return {
        ...state,
        isDeleting: true,
      };
    case "DELETE_CHAT_FAILURE":
      return {
        ...state,
        isDeleting: false,
      };
    case "OPEN_DELETE_CONFIRM":
      return {
        ...state,
        isDeleteOpen: true,
        deletingChatId: action.payload,
      };
    case "CLOSE_DELETE_CONFIRM":
      return {
        ...state,
        isDeleteOpen: false,
        deletingChatId: null,
        isDeleting: false,
      };
    default:
      return state;
  }
}

export default function ConversationsPage() {
  const { orgId, chatId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const cancelRef = useRef();

  const [state, dispatch] = useReducer(conversationReducer, initialState);

  const fetchChats = useCallback(async (options = {}) => {
    const { isLoadMore = false, term = "", pageNum = 1 } = options;
    try {
      dispatch({ type: "FETCH_CHATS_START", payload: { isLoadMore } });

      const { data } = await instance.get(`/api/v1/organizations/${orgId}/chats`, {
        params: {
          search: term || undefined,
          page: pageNum,
          limit: 10,
        },
      });

      const newChats = data.data || [];
      dispatch({
        type: "FETCH_CHATS_SUCCESS",
        payload: {
          chats: newChats,
          page: pageNum,
          hasMore: data.pagination?.totalPages > pageNum,
          isLoadMore,
        },
      });
    } catch (error) {
      console.error("Error fetching chats:", error);
      dispatch({ type: "FETCH_CHATS_FAILURE" });
    }
  }, [orgId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChats({ isLoadMore: false, term: state.searchTerm, pageNum: 1 });
    }, 500);
    return () => clearTimeout(timer);
  }, [state.searchTerm, fetchChats]);

  const fetchChatMessages = useCallback(async (id) => {
    try {
      dispatch({ type: "FETCH_MESSAGES_START" });
      const { data } = await instance.get(`/api/v1/organizations/${orgId}/chats/${id}`);
      dispatch({ type: "FETCH_MESSAGES_SUCCESS", payload: data.data });
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      dispatch({ type: "FETCH_MESSAGES_FAILURE" });
    }
  }, [orgId]);

  useEffect(() => {
    if (chatId) {
      fetchChatMessages(chatId);
    } else {
      dispatch({ type: "SET_CURRENT_CHAT_NULL" });
    }
  }, [chatId, fetchChatMessages]);

  const handleDeleteChat = useCallback((id) => {
    dispatch({ type: "OPEN_DELETE_CONFIRM", payload: id });
  }, []);

  const handleConfirmDelete = async () => {
    const id = state.deletingChatId;
    if (!id) return;

    try {
      dispatch({ type: "DELETE_CHAT_START" });
      await instance.delete(`/api/v1/organizations/${orgId}/chats/${id}`);
      dispatch({ type: "DELETE_CHAT_SUCCESS", payload: id });
      dispatch({ type: "CLOSE_DELETE_CONFIRM" });
      
      toast({
        title: "Conversation deleted",
        description: "The conversation was deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });

      if (chatId === id) {
        navigate(`/${orgId}/conversations`);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast({
        title: "Error",
        description: "Failed to delete the conversation.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      dispatch({ type: "DELETE_CHAT_FAILURE" });
      dispatch({ type: "CLOSE_DELETE_CONFIRM" });
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    return moment(isoString).format("LT");
  };

  const handleChatSelect = (id) => {
    navigate(`/${orgId}/conversations/${id}`);
  };

  const handleBack = () => {
    navigate(`/${orgId}/conversations`);
  };

  const handleSearchChange = (val) => {
    dispatch({ type: "SET_SEARCH_TERM", payload: val });
  };

  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const sidebarBg = useColorModeValue("white", "gray.900");
  const headerBorderColor = useColorModeValue("gray.100", "whiteAlpha.100");

  return (
    <Box h="100%" overflow="hidden">
      <Flex h="100%" overflow="hidden">
        {!isMobile && (
          <Flex direction="column" w="350px" h="100%" borderRightWidth="1px" borderColor={borderColor} bg={sidebarBg}>
            <Flex p={4} borderBottomWidth="1px" borderColor={headerBorderColor} justify="space-between" align="center">
              <Heading size="md">Conversations</Heading>
            </Flex>
            <Box flex={1} overflow="hidden">
              <ConversationList 
                chats={state.chats} 
                loading={state.loadingChats} 
                loadingMore={state.loadingMore}
                activeChatId={chatId} 
                onChatSelect={handleChatSelect} 
                searchTerm={state.searchTerm}
                onSearchChange={handleSearchChange}
                hasMore={state.hasMore}
                onLoadMore={() => fetchChats({ isLoadMore: true, term: state.searchTerm, pageNum: state.page + 1 })}
              />
            </Box>
          </Flex>
        )}

        <Box flex={1} h="100%" overflow="hidden">
          {isMobile && !chatId ? (
            <Flex direction="column" h="100%" bg={sidebarBg}>
              <Flex p={4} borderBottomWidth="1px" borderColor={headerBorderColor}>
                <Heading size="md">Conversations</Heading>
              </Flex>
              <Box flex={1} overflow="hidden">
                <ConversationList 
                  chats={state.chats} 
                  loading={state.loadingChats} 
                  loadingMore={state.loadingMore}
                  activeChatId={chatId} 
                  onChatSelect={handleChatSelect} 
                  searchTerm={state.searchTerm}
                  onSearchChange={handleSearchChange}
                  hasMore={state.hasMore}
                  onLoadMore={() => fetchChats({ isLoadMore: true, term: state.searchTerm, pageNum: state.page + 1 })}
                />
              </Box>
            </Flex>
          ) : (
            <ChatWindow 
              chatId={chatId}
              currentChat={state.currentChat}
              loading={state.loadingMessages}
              isMobile={isMobile}
              onBack={handleBack}
              formatTime={formatTime}
              onDelete={handleDeleteChat}
            />
          )}
        </Box>
      </Flex>

      <AlertDialog
        isOpen={state.isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => dispatch({ type: "CLOSE_DELETE_CONFIRM" })}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent
            borderRadius="xl"
            mx={4}
            bg={sidebarBg}
            border="1px solid"
            borderColor={borderColor}
          >
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Conversation
            </AlertDialogHeader>

            <AlertDialogBody fontSize="sm">
              Are you sure you want to delete this conversation? This action cannot be undone and will permanently remove all associated messages.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => dispatch({ type: "CLOSE_DELETE_CONFIRM" })}
                size="sm"
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmDelete}
                ml={3}
                size="sm"
                isLoading={state.isDeleting}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
