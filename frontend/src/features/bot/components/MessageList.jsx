import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MessageItem, { groupChatMessages } from "../MessageItem";

const MessageList = ({ messages, formatTime, onSelectIceBreaker, isIcebreakersLoading }) => {
  const displayMessages = useMemo(() => groupChatMessages(messages), [messages]);

  return (
    <AnimatePresence initial={false}>
      {displayMessages.map((msg, i) => (
        <motion.div
          key={msg.id || `${i}-${msg.timestamp}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        >
          <MessageItem
            msg={msg}
            formatTime={formatTime}
            onSelectIceBreaker={onSelectIceBreaker}
            isLast={i === displayMessages.length - 1}
            isIcebreakersLoading={isIcebreakersLoading && i === displayMessages.length - 1}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

export default MessageList;
