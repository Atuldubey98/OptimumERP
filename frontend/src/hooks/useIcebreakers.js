import { useEffect, useRef, useState } from "react";
import instance from "../instance";

export const useIcebreakers = ({
  orgId,
  provider,
  iceBreakers,
  selectedModel,
  messages,
  isTyping,
  setMessages,
}) => {
  const lastProcessedRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isAutogenerateEnabled =
      iceBreakers?.enabled && iceBreakers?.autogenerate;

    if (!isAutogenerateEnabled || !orgId || isTyping || !messages.length) {
      setIsLoading(false);
      return;
    }

    const lastMsg = messages[messages.length - 1];
    if (
      !lastMsg ||
      lastMsg.role !== "ai" ||
      lastMsg.streaming ||
      !lastMsg.content ||
      lastMsg.content === "Critical error encountered. Please try again."
    ) {
      setIsLoading(false);
      return;
    }

    const msgKey = `${lastMsg.timestamp || ""}_${lastMsg.content.slice(0, 30)}`;
    if (
      lastProcessedRef.current === msgKey ||
      (lastMsg.icebreakers && lastMsg.icebreakers.length > 0)
    ) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(async () => {
      lastProcessedRef.current = msgKey;
      try {
        const userMsgs = messages.filter((m) => m.role === "user");
        const lastUserPrompt =
          userMsgs.length > 0 ? userMsgs[userMsgs.length - 1].content : "";

        const { data } = await instance.post(
          `/api/v1/organizations/${orgId}/chats/icebreakers`,
          {
            message: lastMsg.content,
            userPrompt: lastUserPrompt,
            providerId: provider?._id,
            model: selectedModel,
          }
        );

        const prompts = data?.data?.prompts || [];
        if (prompts.length > 0) {
          setMessages((prev) => {
            if (!prev.length) return prev;
            const idx = prev.length - 1;
            if (prev[idx]?.role === "ai") {
              const updated = { ...prev[idx], icebreakers: prompts };
              return [...prev.slice(0, -1), updated];
            }
            return prev;
          });
        }
      } catch (error) {
        // Silently ignore if icebreakers request fails
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [messages, isTyping, orgId, provider, selectedModel, setMessages]);

  return { isLoading };
};
