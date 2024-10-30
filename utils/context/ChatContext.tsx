'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ChatContextType = {
  chatOpen: boolean;
  setChatOpen: (value: boolean) => void;
  receiverId: string | null;
  setReceiverId: (value: string | null) => void;
};

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [receiverId, setReceiverId] = useState<string | null>(null);

  return (
    <ChatContext.Provider
      value={{ chatOpen, setChatOpen, receiverId, setReceiverId }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
