import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Box,
  Text,
  Badge,
  Flex,
  IconButton,
  Spinner,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../../instance";
import { MdDeleteOutline, MdOutlineMarkEmailRead } from "react-icons/md";
import moment from "moment";
import useAsyncCall from "../../hooks/useAsyncCall";

export default function NotificationModal({ isOpen, onClose, onRefreshCount }) {
  const { t } = useTranslation("common");
  const { orgId } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();
  const navigate = useNavigate();
  const { requestAsyncHandler } = useAsyncCall();

  const fetchNotifications = async (pageNumber = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/notifications`,
        {
          params: {
            page: pageNumber,
            limit: 10,
          },
        }
      );

      if (append) {
        setNotifications((prev) => [...prev, ...data.notifications]);
      } else {
        setNotifications(data.notifications);
      }
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchNotifications(1, false);
    }
  }, [isOpen, orgId]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchNotifications(page + 1, true);
    }
  };

  const handleNotificationClick = (notification) => {

    if (notification.data?.event === "link_to" && notification.data?.data) {
      navigate(`/${notification.data.data}`);
    }
  };

  const markAsRead = requestAsyncHandler(async (id) => {
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      await instance.patch(
        `/api/v1/organizations/${orgId}/notifications/${id}/read`
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      onRefreshCount();
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  });

  const markAllAsRead = requestAsyncHandler(async () => {
    await instance.patch(
      `/api/v1/organizations/${orgId}/notifications/mark-all-read`
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    onRefreshCount();
    toast({
      title: t("notifications.all_marked_read"),
      status: "success",
      duration: 2000,
    });
  });

  const deleteNotification = requestAsyncHandler(async (id) => {
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      await instance.delete(
        `/api/v1/organizations/${orgId}/notifications/${id}`
      );
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      onRefreshCount();
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "full", md: "lg" }}
      scrollBehavior="inside"
      motionPreset="slideInBottom"
    >
      <ModalOverlay />
      <ModalContent borderRadius={{ base: 0, md: "md" }}>
        <ModalHeader borderBottomWidth="1px" px={{ base: 4, md: 6 }}>
          <Text fontSize="xl" fontWeight="bold">
            {t("notifications.title", "Notifications")}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={0}>
          {loading ? (
            <Flex justify="center" align="center" h="200px">
              <Spinner />
            </Flex>
          ) : notifications.length === 0 ? (
            <Flex justify="center" align="center" h="200px">
              <Text color="gray.500">{t("notifications.empty", "No notifications")}</Text>
            </Flex>
          ) : (
            <VStack align="stretch" spacing={0}>
              {notifications.map((notification) => (
                <Box
                  key={notification._id}
                  p={{ base: 4, md: 5 }}
                  bg={notification.isRead ? "transparent" : "blue.50"}
                  _dark={{ bg: notification.isRead ? "transparent" : "whiteAlpha.100" }}
                  borderBottomWidth="1px"
                  transition="background 0.2s"
                  cursor={notification.data?.event ? "pointer" : "default"}
                  _hover={notification.data?.event ? { bg: "gray.50", _dark: { bg: "whiteAlpha.200" } } : {}}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <Flex justify="space-between" align="start" gap={2}>
                    <VStack align="start" spacing={1} flex={1}>
                      <Flex align="center" gap={2} flexWrap="wrap">
                        <Text fontWeight="bold" fontSize={{ base: "md", md: "sm" }}>
                          {notification.title}
                        </Text>
                        <Badge
                          colorScheme={
                            notification.type === "error"
                              ? "red"
                              : notification.type === "warning"
                                ? "orange"
                                : notification.type === "success"
                                  ? "green"
                                  : "blue"
                          }
                          fontSize="2xs"
                        >
                          {notification.type}
                        </Badge>
                      </Flex>
                      <Text fontSize={{ base: "sm", md: "sm" }}>{notification.message}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {moment(notification.createdAt).fromNow()}
                      </Text>
                    </VStack>
                    <Flex gap={2} align="center">
                      {!notification.isRead && (
                        <IconButton
                          size="sm"
                          variant="ghost"
                          icon={<MdOutlineMarkEmailRead />}
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                          isLoading={processingIds.has(notification._id)}
                          aria-label="Mark as read"
                        />
                      )}
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        icon={<MdDeleteOutline />}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        isLoading={processingIds.has(notification._id)}
                        aria-label="Delete"
                      />
                    </Flex>
                  </Flex>
                </Box>
              ))}
              {page < totalPages && (
                <Flex justify="center" p={4}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleLoadMore}
                    isLoading={loadingMore}
                    width={{ base: "full", md: "auto" }}
                  >
                    {t("notifications.load_more", "Load more")}
                  </Button>
                </Flex>
              )}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter gap={2} px={{ base: 4, md: 6 }}>
          <Button
            size="sm"
            variant="outline"
            colorScheme="blue"
            leftIcon={<MdOutlineMarkEmailRead />}
            onClick={markAllAsRead}
            isDisabled={notifications.every((n) => n.isRead)}
            width={{ base: "full", md: "auto" }}
          >
            {t("notifications.mark_all_read", "Mark all as read")}
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            size="sm"
            width={{ base: "full", md: "auto" }}
          >
            {t("common:actions.close", "Close")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
