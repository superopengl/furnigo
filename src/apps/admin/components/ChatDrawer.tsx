"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { Drawer, Spin, Typography, Button, Tag, Input, Modal, Select, Avatar, App } from "antd";
import { CloseOutlined, ReloadOutlined, PlusOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/lib/auth";
import { colors } from "@/lib/theme";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { UserAvatar } from "./UserAvatar";
import type { Message } from "@furnigo/types";
import { format as timeago } from "timeago.js";

const { Text } = Typography;

function getDividerLabel(current: string, previous: string | null): string | null {
  const curr = new Date(current);
  const prev = previous ? new Date(previous) : null;
  const isNewDay = !prev || curr.toDateString() !== prev.toDateString();
  if (isNewDay) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const target = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate());
    if (target.getTime() === today.getTime()) return "Today";
    if (target.getTime() === yesterday.getTime()) return "Yesterday";
    const date = curr.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    return `${date} (${timeago(curr)})`;
  }

  if (prev && curr.getTime() - prev.getTime() >= 60 * 60 * 1000) {
    return curr.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  return null;
}

interface ChatDetail {
  id: string;
  title: string | null;
  participants: { userId: string; role: string; displayName: string | null; email: string; avatarUrl: string | null }[];
  messages: Message[];
}

interface ChatDrawerProps {
  chatId: string | null;
  onClose: () => void;
}

export function ChatDrawer({ chatId, onClose }: ChatDrawerProps) {
  const { user } = useAuth();
  const { message: antMessage } = App.useApp();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [searchOptions, setSearchOptions] = useState<{ label: React.ReactNode; value: string; email: string }[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [addingUsers, setAddingUsers] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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
      scrollToBottom();
    };

    socket.on("message:new", handleNewMessage);

    const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();
    const handleTyping = (data: { chatId: string; userId: string }) => {
      if (data.chatId !== chatId || data.userId === user?.id) return;
      setTypingUsers((prev) => new Set(prev).add(data.userId));
      // Clear existing timer for this user
      if (typingTimers.has(data.userId)) clearTimeout(typingTimers.get(data.userId)!);
      typingTimers.set(data.userId, setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(data.userId);
          return next;
        });
        typingTimers.delete(data.userId);
      }, 3000));
    };
    socket.on("typing", handleTyping);

    // Handle chat title updates
    const handleTitleUpdate = (data: { chatId: string; title: string }) => {
      if (data.chatId !== chatId) return;
      queryClient.setQueryData(["admin-chat", chatId], (old: ChatDetail | undefined) => {
        if (!old) return old;
        return { ...old, title: data.title };
      });
    };
    socket.on("chat:titleUpdated", handleTitleUpdate);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("chat:titleUpdated", handleTitleUpdate);
      typingTimers.forEach(clearTimeout);
      setTypingUsers(new Set());
      socket.emit("leave", chatId);
    };
  }, [chatId, queryClient, user?.id]);

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

  const senderMap = useMemo(() => {
    const map = new Map<string, ChatDetail["participants"][number]>();
    chat?.participants.forEach((p) => map.set(p.userId, p));
    return map;
  }, [chat?.participants]);

  const existingUserIds = useMemo(
    () => new Set(chat?.participants.map((p) => p.userId) ?? []),
    [chat?.participants],
  );

  const handleUserSearch = (value: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (value.trim().length < 2) {
      setSearchOptions([]);
      return;
    }
    searchTimerRef.current = setTimeout(async () => {
      const res = await api<{ id: string; email: string; displayName: string | null; avatarUrl: string | null; role: string }[]>(
        `/admin/users/search?q=${encodeURIComponent(value.trim())}`,
      );
      if (!res.success) return;
      const options = res.data
        .filter((u) => !existingUserIds.has(u.id) && !selectedUserIds.includes(u.id))
        .map((u) => ({
          label: (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <UserAvatar user={{ id: u.id, displayName: u.displayName, email: u.email, role: u.role as any, avatarUrl: u.avatarUrl }} size={24} tooltip={false} />
              <span>{u.email}</span>
              {u.displayName && <span style={{ color: colors.textSecondary }}>({u.displayName})</span>}
            </div>
          ),
          value: u.id,
          email: u.email,
        }));
      setSearchOptions(options);
    }, 300);
  };

  const handleAddUsers = async () => {
    if (!chatId || selectedUserIds.length === 0) return;
    setAddingUsers(true);
    try {
      for (const userId of selectedUserIds) {
        await api(`/chats/${chatId}/participants`, {
          method: "POST",
          body: JSON.stringify({ userId, role: "client" }),
        });
      }
      antMessage.success(`Added ${selectedUserIds.length} user(s) to chat`);
      queryClient.invalidateQueries({ queryKey: ["admin-chat", chatId] });
      queryClient.invalidateQueries({ queryKey: ["admin-chats"] });
      setAddUserOpen(false);
      setSelectedUserIds([]);
      setSearchOptions([]);
    } catch {
      antMessage.error("Failed to add users");
    } finally {
      setAddingUsers(false);
    }
  };

  return (
    <Drawer
      open={!!chatId}
      onClose={onClose}
      rootClassName="chat-drawer"
      closable={false}
      styles={{
        wrapper: { width: 480 },
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
          {editingTitle ? (
            <Input
              size="small"
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onPressEnter={async () => {
                const trimmed = titleDraft.trim();
                if (trimmed && chatId) {
                  await api(`/chats/${chatId}`, { method: "PUT", body: JSON.stringify({ title: trimmed }) });
                  queryClient.invalidateQueries({ queryKey: ["admin-chat", chatId] });
                  queryClient.invalidateQueries({ queryKey: ["admin-chats"] });
                }
                setEditingTitle(false);
              }}
              onBlur={() => setEditingTitle(false)}
              style={{ fontSize: 14, color: colors.primary }}
            />
          ) : (
            <Text
              strong
              style={{ fontSize: 16, color: colors.text, cursor: "pointer", display: "block" }}
              ellipsis
              onClick={() => { setTitleDraft(chat?.title || ""); setEditingTitle(true); }}
            >
              {chat?.title || "Untitled Chat"}
            </Text>
          )}
          <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
            {chat?.participants.map((p, i) => (
              <div key={p.userId} style={{ marginLeft: i > 0 ? -6 : 0 }}>
                <UserAvatar
                  user={{ id: p.userId, displayName: p.displayName, email: p.email, role: p.role as any, avatarUrl: p.avatarUrl }}
                  size={36}
                />
              </div>
            ))}
            <Avatar
              size={36}
              style={{
                marginLeft: -6,
                backgroundColor: `${colors.secondary}20`,
                color: colors.secondary,
                cursor: "pointer",
                border: `1.5px dashed ${colors.secondary}60`,
                fontSize: 18,
              }}
              icon={<PlusOutlined />}
              onClick={() => setAddUserOpen(true)}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-chat", chatId] })}
          />
          <Button type="text" size="small" icon={<CloseOutlined style={{ color: colors.primary }} />} onClick={onClose} />
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
            {chat?.messages.map((msg, i) => {
              const sender = msg.senderId ? senderMap.get(msg.senderId) : undefined;
              const prevTime = i > 0 ? chat.messages[i - 1].createdAt : null;
              const dividerLabel = getDividerLabel(msg.createdAt, prevTime);
              return (
                <div key={msg.id}>
                  {dividerLabel && (
                    <div style={{ display: "flex", alignItems: "center", margin: "16px 0 8px", gap: 12, padding: "0 16px" }}>
                      <div style={{ flex: 1, height: 1, background: colors.border }} />
                      <Text style={{ fontSize: 11, color: colors.textSecondary, flexShrink: 0 }}>
                        {dividerLabel}
                      </Text>
                      <div style={{ flex: 1, height: 1, background: colors.border }} />
                    </div>
                  )}
                  <MessageBubble
                    message={msg}
                    isOwn={msg.senderId === user?.id}
                    sender={sender ? { id: sender.userId, displayName: sender.displayName, email: sender.email, role: sender.role as any, avatarUrl: sender.avatarUrl } : undefined}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Typing indicator */}
      {typingUsers.size > 0 && (
        <div style={{ padding: "4px 20px", flexShrink: 0 }}>
          <Text style={{ fontSize: 12, color: colors.textSecondary, fontStyle: "italic" }}>
            {typingUsers.size === 1 ? "Someone is typing..." : "Multiple people are typing..."}
          </Text>
        </div>
      )}

      {/* Input */}
      {chatId && (
        <MessageInput chatId={chatId} onSent={scrollToBottom} />
      )}

      {/* Add Participant Modal */}
      <Modal
        title="Add Participants"
        open={addUserOpen}
        onOk={handleAddUsers}
        onCancel={() => { setAddUserOpen(false); setSelectedUserIds([]); setSearchOptions([]); }}
        okText="Add"
        okButtonProps={{ disabled: selectedUserIds.length === 0, loading: addingUsers }}
      >
        <Select
          mode="multiple"
          showSearch
          placeholder="Search by email..."
          filterOption={false}
          onSearch={handleUserSearch}
          value={selectedUserIds}
          onChange={setSelectedUserIds}
          options={searchOptions}
          style={{ width: "100%" }}
          notFoundContent={null}
        />
      </Modal>
    </Drawer>
  );
}
