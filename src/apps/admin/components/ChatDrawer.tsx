"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Drawer, Spin, Typography, Button, Tag } from "antd";
import { CloseOutlined, ReloadOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import type { Message } from "@furnigo/types";

const { Text } = Typography;

interface ChatDetail {
  id: string;
  title: string | null;
  participants: { userId: string; role: string; displayName: string | null; email: string }[];
  messages: Message[];
}

interface ChatDrawerProps {
  chatId: string | null;
  onClose: () => void;
}

export function ChatDrawer({ chatId, onClose }: ChatDrawerProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const { data: chat, isLoading } = useQuery({
    queryKey: ["admin-chat", chatId],
    queryFn: async () => {
      const res = await api<ChatDetail>(`/admin/chats/${chatId}`);
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    enabled: !!chatId,
  });

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // Scroll to bottom on initial load and new messages
  useEffect(() => {
    if (chat?.messages) scrollToBottom();
  }, [chat?.messages?.length, scrollToBottom]);

  // WebSocket real-time messages
  useEffect(() => {
    if (!chatId) return;

    const socket = getSocket();
    socket.emit("join", chatId);

    const handleNewMessage = (data: { chatId: string; message: Message }) => {
      if (data.chatId !== chatId) return;
      queryClient.setQueryData(["admin-chat", chatId], (old: ChatDetail | undefined) => {
        if (!old) return old;
        // Avoid duplicates
        if (old.messages.some((m) => m.id === data.message.id)) return old;
        return { ...old, messages: [...old.messages, data.message] };
      });
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.emit("leave", chatId);
    };
  }, [chatId, queryClient]);

  // Load older messages on scroll to top
  const handleScroll = async () => {
    const container = messagesContainerRef.current;
    if (!container || loadingOlder || !chat?.messages?.length) return;

    if (container.scrollTop < 50) {
      setLoadingOlder(true);
      const oldestTimestamp = chat.messages[0]?.createdAt;
      const prevHeight = container.scrollHeight;

      try {
        const res = await api<Message[]>(
          `/chats/${chatId}/messages?cursor=${encodeURIComponent(oldestTimestamp)}&limit=50`,
        );
        if (res.success && res.data.length > 0) {
          queryClient.setQueryData(["admin-chat", chatId], (old: ChatDetail | undefined) => {
            if (!old) return old;
            return { ...old, messages: [...res.data, ...old.messages] };
          });
          // Maintain scroll position
          requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight - prevHeight;
          });
        }
      } finally {
        setLoadingOlder(false);
      }
    }
  };

  const participantLabel = chat?.participants
    .map((p) => p.displayName || p.email.split("@")[0])
    .join(", ");

  return (
    <Drawer
      open={!!chatId}
      onClose={onClose}
      width={480}
      rootClassName="chat-drawer"
      closable={false}
      styles={{
        body: { padding: 0, display: "flex", flexDirection: "column", height: "100%" },
        header: { display: "none" },
      }}
    >
      {/* Header */}
      <div
        className="glass-strong"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: `1px solid ${colors.border}`,
          flexShrink: 0,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <Text strong style={{ fontSize: 16, display: "block", color: colors.text }}>
            {chat?.title || "Untitled Chat"}
          </Text>
          <Text
            style={{ fontSize: 12, color: colors.textSecondary }}
            ellipsis
          >
            {participantLabel}
          </Text>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-chat", chatId] })}
          />
          <Button type="text" size="small" icon={<CloseOutlined />} onClick={onClose} />
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 0",
          background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.surface} 100%)`,
        }}
      >
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <Spin />
          </div>
        ) : (
          <>
            {loadingOlder && (
              <div style={{ textAlign: "center", padding: 8 }}>
                <Spin size="small" />
              </div>
            )}
            {chat?.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === user?.id} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      {chatId && (
        <MessageInput chatId={chatId} onSent={scrollToBottom} />
      )}
    </Drawer>
  );
}
