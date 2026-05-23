import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import MessageItem from "../MessageItem";

const MessageList = ({ messages, formatTime }) => {
  return (
    <AnimatePresence initial={false}>
      {messages.map((msg, i) => (
        <motion.div
          key={msg.id || `${i}-${msg.timestamp}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        >
          <MessageItem msg={msg} formatTime={formatTime} />
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

export default MessageList;
