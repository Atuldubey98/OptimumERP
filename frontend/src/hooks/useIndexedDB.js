import { useCallback } from "react";

const DB_NAME = "OptimumERP_DB";
const STORE_NAME = "chat_history";
const DB_VERSION = 1;

export const useIndexedDB = () => {
  const openDB = useCallback(() => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }, []);

  const saveChatHistory = useCallback(async (userId, messages) => {
    if (!userId) return;
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(messages, userId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("IndexedDB Save Error:", error);
    }
  }, [openDB]);

  const getChatHistory = useCallback(async (userId) => {
    if (!userId) return [];
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(userId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("IndexedDB Get Error:", error);
      return [];
    }
  }, [openDB]);

  const deleteChatHistory = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(userId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("IndexedDB Delete Error:", error);
    }
  }, [openDB]);

  return {
    saveChatHistory,
    getChatHistory,
    deleteChatHistory
  };
};
