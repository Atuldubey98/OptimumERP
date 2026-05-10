import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import MessageItem from "../MessageItem";

const MessageList = ({ messages, formatTime }) => {
  return (
    <AnimatePresence initial={false}>
      {messages.map((msg, i) => (
        <motion.div
          key={msg.id || `${i}-${msg.timestamp}`}
          initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          layout
        >
          <MessageItem msg={msg} formatTime={formatTime} />
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

export default MessageList;
