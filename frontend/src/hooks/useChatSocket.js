import { useState, useEffect, useRef, useCallback } from "react";
import useAuth from "./useAuth";
import instance, { baseURL } from "../instance";
import { useIndexedDB } from "./useIndexedDB";

export const useChatSocket = (orgId, providerId) => {
  const { user } = useAuth();
  const userId = user?._id;
  const [messages, setMessages] = useState([]);
  const loadedId = useRef(null);

  const { getChatHistory, saveChatHistory, deleteChatHistory } = useIndexedDB();

  const [activeChatId, setActiveChatId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Assistant is thinking...");

  const abortControllerRef = useRef(null);
  const statusQueue = useRef([]);
  const isProcessingQueue = useRef(false);

  useEffect(() => {
    if (!userId) {
      setMessages([]);
      loadedId.current = null;
      setActiveChatId(null);
      return;
    }
    const loadHistory = async () => {
      try {
        const saved = await getChatHistory(userId);
        setMessages(saved || []);
        loadedId.current = userId;
      } catch (e) {
        setMessages([]);
        loadedId.current = userId;
      }
    };
    loadHistory();
  }, [userId, getChatHistory]);

  useEffect(() => {
    if (userId && loadedId.current === userId) {
      saveChatHistory(userId, messages.slice(-50));
    }
  }, [messages, userId, saveChatHistory]);

  useEffect(() => {
    if (orgId && providerId) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [orgId, providerId]);

  const processStatusQueue = useCallback(() => {
    if (isProcessingQueue.current || statusQueue.current.length === 0) return;

    isProcessingQueue.current = true;
    const nextMsg = statusQueue.current.shift();
    setStatusMsg(nextMsg);

    setTimeout(() => {
      isProcessingQueue.current = false;
      processStatusQueue();
    }, 800);
  }, []);

  const handleEventData = useCallback((data) => {
    if (data.event === "ready" || data.event === "chat_switched") {
      setActiveChatId(data.chatId);

    } else if (data.event === "stream_chunk") {
      setIsTyping(true);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "ai" && last?.streaming) {
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + data.content },
          ];
        }
        return [
          ...prev,
          {
            role: "ai",
            content: data.content,
            streaming: true,
            timestamp: new Date().toISOString(),
            downloads: [],
          },
        ];
      });

    } else if (data.event === "stream_end") {
      statusQueue.current = [];
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "ai" && last?.streaming) {
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              content: data.aborted ? "Generation stopped." : last.content,
              streaming: false,
              downloads: data.downloads || [],
            },
          ];
        }
        if (data.aborted) return prev;
        return [
          ...prev,
          {
            role: "ai",
            content: data.message || "",
            streaming: false,
            timestamp: new Date().toISOString(),
            downloads: data.downloads || [],
          },
        ];
      });
      setIsTyping(false);
      setStatusMsg("Assistant is thinking...");

    } else if (data.event === "ai_response" || data.type === "message") {
      statusQueue.current = [];
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: data.message || data.content,
          timestamp: new Date().toISOString(),
          downloads: data.downloads || [],
        },
      ]);
      setIsTyping(false);
      setStatusMsg("Assistant is thinking...");

    } else if (data.type === "status" || data.event === "status") {
      statusQueue.current.push(data.message || data.content);
      processStatusQueue();
    }
  }, [processStatusQueue]);

  const sendMessage = useCallback((payload, userMessage) => {
    if (!orgId || !providerId) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsTyping(true);
    statusQueue.current = [];
    setStatusMsg("Assistant is thinking...");
    setMessages((prev) => [...prev, userMessage]);

    const url = `${baseURL}/api/v1/organizations/${orgId}/chats/message`;

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...payload, providerId }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop();

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            try {
              const data = JSON.parse(trimmed.slice(5).trim());
              handleEventData(data);
            } catch {
              // skip malformed events
            }
          }
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setIsTyping(false);
        setStatusMsg("Assistant is thinking...");
      })
      .finally(() => {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      });
  }, [orgId, providerId, handleEventData]);

  const clearHistory = async (model, clearProviderId) => {
    await instance.post(`/api/v1/organizations/${orgId}/chats/clear`, {
      model,
      chatId: activeChatId,
      providerId: clearProviderId,
    });
    setMessages([]);
    await deleteChatHistory(userId);
  };

  const abortMessage = useCallback(() => {
    if (abortControllerRef.current && isTyping) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsTyping(false);
      setStatusMsg("Generation stopped.");
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "ai" && last?.streaming) {
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content || "Generation stopped.", streaming: false },
          ];
        }
        return prev;
      });
    }
  }, [isTyping]);

  return {
    messages,
    setMessages,
    isConnected,
    isTyping,
    statusMsg,
    sendMessage,
    clearHistory,
    activeChatId,
    abortMessage,
  };
};
