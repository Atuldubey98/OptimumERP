import { useState, useEffect, useRef } from "react";
import useAuth from "./useAuth";
import instance from "../instance";


export const useChatSocket = (orgId) => {
  const { user } = useAuth();
  const userId = user?._id;
  const [messages, setMessages] = useState([]);
  const loadedId = useRef(null);


  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Assistant is thinking...");

  const socket = useRef(null);
  const statusQueue = useRef([]);
  const isProcessingQueue = useRef(false);

  useEffect(() => {
    if (!userId) {
      setMessages([]);
      loadedId.current = null;
      return;
    }
    try {
      const saved = localStorage.getItem(`chat_history_${userId}`);
      setMessages(saved ? JSON.parse(saved) : []);
      loadedId.current = userId;
    } catch (e) {
      setMessages([]);
      loadedId.current = userId;
    }
  }, [userId]);

  useEffect(() => {
    if (userId && loadedId.current === userId) {
      localStorage.setItem(`chat_history_${userId}`, JSON.stringify(messages.slice(-20)));
    }
  }, [messages, userId]);



  const processStatusQueue = () => {
    if (isProcessingQueue.current || statusQueue.current.length === 0) return;

    isProcessingQueue.current = true;
    const nextMsg = statusQueue.current.shift();
    setStatusMsg(nextMsg);

    setTimeout(() => {
      isProcessingQueue.current = false;
      processStatusQueue();
    }, 800);
  };

  useEffect(() => {
    let reconnectionTimer;
    const connect = () => {
      const wsUrl = `ws://localhost:3000?orgId=${orgId}`;
      if (!orgId) return;
      socket.current = new WebSocket(wsUrl);

      socket.current.onopen = () => setIsConnected(true);
      socket.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "ai_response" || data.type === "message") {
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
        } catch (err) {
          setIsTyping(false);
          setStatusMsg("Assistant is thinking...");
        }
      };
      socket.current.onclose = () => {
        setIsConnected(false);
        reconnectionTimer = setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      if (socket.current) {
        socket.current.onclose = null;
        socket.current.onerror = null;
        socket.current.close();
      }
      clearTimeout(reconnectionTimer);
    };

  }, [orgId]);

  const sendMessage = (payload, userMessage) => {
    if (socket.current && isConnected) {
      setIsTyping(true);
      statusQueue.current = [];
      setStatusMsg("Assistant is thinking...");
      socket.current.send(JSON.stringify(payload));
      setMessages((prev) => [...prev, userMessage]);
    }
  };

  const clearHistory = async (model) => {
    try {
      await instance.post(`/api/v1/organizations/${orgId}/chats/clear`, { model });
      setMessages([]);
      localStorage.removeItem(`chat_history_${userId}`);
    } catch (error) {
      console.error("Failed to clear chat history", error);
    }
  };

  return {
    messages,
    setMessages,
    isConnected,
    isTyping,
    statusMsg,
    sendMessage,
    clearHistory,
  };
};