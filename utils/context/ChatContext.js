"use client"
import { createContext, useContext, useState } from "react";

const ChatContext = createContext(null);

//cant get this to work as a typescript file
export function ChatProvider({ children }) {
    const [chatOpen, setChatOpen] = useState(false);
    const [receiverId, setReceiverId] = useState(null);

    return (
        <ChatContext.Provider value={{ chatOpen, setChatOpen, receiverId, setReceiverId }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
  return useContext(ChatContext);
}