"use client";

import { useState } from "react";
import { Typography, Input, Button, Avatar, Tag, Empty, Spin, Badge } from "antd";
import {
  SearchOutlined,
  LogoutOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { AuthGuard } from "@/components/AuthGuard";
import { ChatDrawer } from "@/components/ChatDrawer";
import { colors } from "@/lib/theme";
import type { Message } from "@furnigo/types";

const { Title, Text } = Typography;

interface ChatListItem {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  participants: {
    userId: string;
    role: string;
    displayName: string | null;
    email: string;
  }[];
  lastMessage: Message | null;
}

function ChatsContent() {
  const { user, logout } = useAuth();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: chats, isLoading, refetch } = useQuery({
    queryKey: ["admin-chats"],
    queryFn: async () => {
      const res = await api<ChatListItem[]>("/admin/chats");
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    refetchInterval: 30_000,
  });

  const filtered = chats?.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.participants.some(
        (p) =>
          p.displayName?.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q),
      )
    );
  });

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getPreview = (msg: Message | null) => {
    if (!msg) return "No messages yet";
    if (msg.contentType === "image") return "Sent an image";
    if (msg.contentType === "video") return "Sent a video";
    if (msg.contentType === "attachment") return "Sent a file";
    return (msg.content as any)?.text || "";
  };

  const getRoleColor = (role: string) => {
    if (role === "client") return colors.secondary;
    if (role === "agent") return colors.accent;
    return colors.primary;
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.background }}>
      {/* Header */}
      <div
        className="glass-strong"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "16px 24px",
          borderBottom: `1px solid ${colors.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: colors.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: colors.white, fontSize: 16, fontWeight: 700 }}>F</span>
          </div>
          <Title level={4} style={{ margin: 0, color: colors.text }}>
            Chats
          </Title>
        </div>

        <div style={{ flex: 1, maxWidth: 400 }}>
          <Input
            prefix={<SearchOutlined style={{ color: colors.textSecondary }} />}
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ borderRadius: 20 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            {user?.displayName || user?.email}
          </Text>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={logout}
            style={{ color: colors.textSecondary }}
          />
        </div>
      </div>

      {/* Chat List */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : !filtered?.length ? (
          <Empty
            image={<MessageOutlined style={{ fontSize: 48, color: colors.border }} />}
            description={
              search ? (
                <Text style={{ color: colors.textSecondary }}>No chats match your search</Text>
              ) : (
                <Button
                  type="link"
                  onClick={() => refetch()}
                  style={{ color: colors.secondary, padding: 0 }}
                >
                  Refresh
                </Button>
              )
            }
            style={{ padding: 60 }}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((chat) => {
              const clients = chat.participants.filter((p) => p.role === "client");
              const agents = chat.participants.filter((p) => p.role !== "client");

              return (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className="glass"
                  style={{
                    padding: "16px 20px",
                    borderRadius: 16,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 12px 40px rgba(61,50,40,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "none";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 8px 32px rgba(61,50,40,0.08)";
                  }}
                >
                  {/* Avatar */}
                  <Avatar
                    size={48}
                    icon={<UserOutlined />}
                    style={{
                      backgroundColor: colors.surface,
                      color: colors.primary,
                      flexShrink: 0,
                    }}
                  >
                    {clients[0]?.displayName?.[0]?.toUpperCase() ||
                      clients[0]?.email?.[0]?.toUpperCase() ||
                      "?"}
                  </Avatar>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        strong
                        style={{
                          fontSize: 15,
                          color: colors.text,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {chat.title || "Untitled Chat"}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary, flexShrink: 0, marginLeft: 12 }}>
                        {formatTime(chat.lastMessage?.createdAt || chat.updatedAt)}
                      </Text>
                    </div>

                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginBottom: 6,
                      }}
                    >
                      {getPreview(chat.lastMessage)}
                    </Text>

                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {chat.participants.map((p) => (
                        <Tag
                          key={p.userId}
                          style={{
                            margin: 0,
                            borderRadius: 8,
                            fontSize: 11,
                            lineHeight: "18px",
                            border: "none",
                            background: `${getRoleColor(p.role)}18`,
                            color: getRoleColor(p.role),
                          }}
                        >
                          {p.displayName || p.email.split("@")[0]}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ChatDrawer chatId={activeChatId} onClose={() => setActiveChatId(null)} />
    </div>
  );
}

export default function ChatsPage() {
  return (
    <AuthGuard>
      <ChatsContent />
    </AuthGuard>
  );
}
