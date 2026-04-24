"use client";

import { useState } from "react";
import { Typography, Input, Button, Tag, Table, Space, Avatar, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  LogoutOutlined,
  ReloadOutlined,
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

interface Participant {
  userId: string;
  role: string;
  displayName: string | null;
  email: string;
}

interface ChatListItem {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
  lastMessage: Message | null;
}

const getRoleColor = (role: string) => {
  if (role === "client") return colors.secondary;
  if (role === "agent") return colors.accent;
  return colors.primary;
};

const getPreview = (msg: Message | null) => {
  if (!msg) return "—";
  if (msg.contentType === "image") return "Sent an image";
  if (msg.contentType === "video") return "Sent a video";
  if (msg.contentType === "attachment") return "Sent a file";
  return (msg.content as any)?.text || "";
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) +
    " " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

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

  const columns: ColumnsType<ChatListItem> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => (a.title || "").localeCompare(b.title || ""),
      render: (title: string | null) => (
        <Text strong style={{ color: colors.text }}>
          {title || "Untitled Chat"}
        </Text>
      ),
    },
    {
      title: "Participants",
      key: "participants",
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {record.participants.map((p) => (
            <div key={p.userId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar
                size={24}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: `${getRoleColor(p.role)}20`,
                  color: getRoleColor(p.role),
                  fontSize: 12,
                  flexShrink: 0,
                }}
              >
                {(p.displayName?.[0] || p.email[0]).toUpperCase()}
              </Avatar>
              <div style={{ minWidth: 0 }}>
                <Text style={{ fontSize: 13, color: colors.text, display: "block", lineHeight: 1.3 }} ellipsis>
                  {p.displayName || p.email.split("@")[0]}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary, display: "block", lineHeight: 1.3 }} ellipsis>
                  {p.email}
                </Text>
              </div>
              <Tag
                style={{
                  margin: 0,
                  borderRadius: 6,
                  fontSize: 10,
                  lineHeight: "16px",
                  border: "none",
                  background: `${getRoleColor(p.role)}15`,
                  color: getRoleColor(p.role),
                  flexShrink: 0,
                }}
              >
                {p.role}
              </Tag>
            </div>
          ))}
        </div>
      ),
      responsive: ["md"],
    },
    {
      title: "Last Message",
      key: "lastMessage",
      ellipsis: true,
      sorter: (a, b) => {
        const aTime = a.lastMessage?.createdAt || a.updatedAt;
        const bTime = b.lastMessage?.createdAt || b.updatedAt;
        return new Date(aTime).getTime() - new Date(bTime).getTime();
      },
      defaultSortOrder: "descend",
      render: (_, record) => (
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
          {getPreview(record.lastMessage)}
        </Text>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (val: string) => (
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{formatDateTime(val)}</Text>
      ),
      responsive: ["lg"],
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 170,
      sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      defaultSortOrder: "descend",
      render: (val: string) => (
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{formatDateTime(val)}</Text>
      ),
      responsive: ["lg"],
    },
  ];

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

        <Space>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            {user?.displayName || user?.email}
          </Text>
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            style={{ color: colors.textSecondary }}
          />
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={logout}
            style={{ color: colors.textSecondary }}
          />
        </Space>
      </div>

      {/* Chat Table */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        <Table<ChatListItem>
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `${total} chats` }}
          onRow={(record) => ({
            onClick: () => setActiveChatId(record.id),
            style: { cursor: "pointer" },
          })}
          locale={{
            emptyText: (
              <Button
                type="link"
                onClick={() => refetch()}
                style={{ color: colors.secondary }}
              >
                Refresh
              </Button>
            ),
          }}
          style={{ borderRadius: 12, overflow: "hidden" }}
        />
      </div>

      <ChatDrawer chatId={activeChatId} onClose={() => setActiveChatId(null)} />
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <ChatsContent />
    </AuthGuard>
  );
}
