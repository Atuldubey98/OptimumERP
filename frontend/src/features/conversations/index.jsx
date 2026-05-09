import {
  Box,
  Flex,
  Heading,
  useColorModeValue,
  useBreakpointValue,
} from "@chakra-ui/react";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../common/main-layout";
import instance from "../../instance";
import moment from "moment";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

export default function ConversationsPage() {
  const { orgId, chatId } = useParams();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const fetchChats = useCallback(async (isLoadMore = false) => {
    try {
      const currentPage = isLoadMore ? page + 1 : 1;
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoadingChats(true);
      }

      const { data } = await instance.get(`/api/v1/organizations/${orgId}/chats`, {
        params: {
          search: searchTerm || undefined,
          page: currentPage,
          limit: 10,
        },
      });

      const newChats = data.data || [];
      if (isLoadMore) {
        setChats((prev) => [...prev, ...newChats]);
        setPage(currentPage);
      } else {
        setChats(newChats);
        setPage(1);
      }

      setHasMore(data.pagination?.totalPages > currentPage);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoadingChats(false);
      setLoadingMore(false);
    }
  }, [orgId, searchTerm, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchChatMessages = useCallback(async (id) => {
    try {
      setLoadingMessages(true);
      const { data } = await instance.get(`/api/v1/organizations/${orgId}/chats/${id}`);
      setCurrentChat(data.data);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  }, [orgId]);



  useEffect(() => {
    if (chatId) {
      fetchChatMessages(chatId);
    } else {
      setCurrentChat(null);
    }
  }, [chatId, fetchChatMessages]);

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

  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const sidebarBg = useColorModeValue("white", "gray.900");
  const headerBorderColor = useColorModeValue("gray.100", "whiteAlpha.100");

  return (

      <Box h="calc(100vh - 64px)" overflow="hidden">
        <Flex h="100%" overflow="hidden">
          {/* Desktop List Sidebar */}
          {!isMobile && (
            <Box w="350px" h="100%" borderRightWidth="1px" borderColor={borderColor} bg={sidebarBg}>
              <Flex p={4} borderBottomWidth="1px" borderColor={headerBorderColor} justify="space-between" align="center">
                <Heading size="md">Conversations</Heading>
              </Flex>
              <ConversationList 
                chats={chats} 
                loading={loadingChats} 
                loadingMore={loadingMore}
                activeChatId={chatId} 
                onChatSelect={handleChatSelect} 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                hasMore={hasMore}
                onLoadMore={() => fetchChats(true)}
              />
            </Box>
          )}

          {/* Main Content Area */}
          <Box flex={1} h="100%">
            {isMobile && !chatId ? (
              <Box h="100%" bg={sidebarBg}>
                <Flex p={4} borderBottomWidth="1px" borderColor={headerBorderColor}>
                  <Heading size="md">Conversations</Heading>
                </Flex>
                <ConversationList 
                  chats={chats} 
                  loading={loadingChats} 
                  loadingMore={loadingMore}
                  activeChatId={chatId} 
                  onChatSelect={handleChatSelect} 
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  hasMore={hasMore}
                  onLoadMore={() => fetchChats(true)}
                />
              </Box>
            ) : (
              <ChatWindow 
                chatId={chatId}
                currentChat={currentChat}
                loading={loadingMessages}
                isMobile={isMobile}
                onBack={handleBack}
                formatTime={formatTime}
              />
            )}
          </Box>
        </Flex>
      </Box>

  );
}
