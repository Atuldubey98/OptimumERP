import { useState, useEffect, useRef } from "react";

export const useChatSocket = (orgId) => {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(`chat_history_${orgId}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Assistant is thinking...");
  
  const socket = useRef(null);
  const statusQueue = useRef([]);
  const isProcessingQueue = useRef(false);

  useEffect(() => {
    localStorage.setItem(`chat_history_${orgId}`, JSON.stringify(messages.slice(-20)));
  }, [messages, orgId]);

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
      if (socket.current) socket.current.close();
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

  return {
    messages,
    setMessages,
    isConnected,
    isTyping,
    statusMsg,
    sendMessage,
  };
};