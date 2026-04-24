"use client";

import { useState } from "react";
import { Typography, Input, Button, Tag, Table, Space, Tooltip, ConfigProvider, theme as antTheme } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  LogoutOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { AuthGuard } from "@/components/AuthGuard";
import { ChatDrawer } from "@/components/ChatDrawer";
import { UserAvatar } from "@/components/UserAvatar";
import { colors } from "@/lib/theme";
import type { Message } from "@furnigo/types";

const { Title, Text } = Typography;

const dk = {
  bg: "#0f0d0b",
  surface: "#1a1714",
  border: "rgba(255,255,255,0.08)",
  text: "rgba(255,255,255,0.88)",
  textSecondary: "rgba(255,255,255,0.4)",
  hover: "rgba(255,255,255,0.04)",
};

interface Participant {
  userId: string;
  role: string;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
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
  return "rgba(255,255,255,0.5)";
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

const darkTheme = {
  algorithm: antTheme.darkAlgorithm,
  token: {
    colorPrimary: colors.secondary,
    colorBgBase: dk.bg,
    colorBgContainer: dk.surface,
    colorBorderSecondary: dk.border,
    colorText: dk.text,
    colorTextSecondary: dk.textSecondary,
    borderRadius: 12,
  },
  components: {
    Table: {
      headerBg: "rgba(255,255,255,0.03)",
      headerColor: dk.textSecondary,
      rowHoverBg: dk.hover,
      borderColor: dk.border,
      colorBgContainer: dk.surface,
    },
    Input: {
      colorBgContainer: "rgba(255,255,255,0.06)",
      colorBorder: dk.border,
    },
    Button: {
      colorText: dk.textSecondary,
    },
    Pagination: {
      colorText: dk.textSecondary,
    },
  },
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
        <Text strong style={{ color: dk.text }}>
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
              <UserAvatar
                user={{ id: p.userId, displayName: p.displayName, email: p.email, role: p.role as any, avatarUrl: p.avatarUrl }}
                size={24}
              />
              <div style={{ minWidth: 0 }}>
                <Text style={{ fontSize: 13, color: dk.text, display: "block", lineHeight: 1.3 }} ellipsis>
                  {p.displayName || p.email.split("@")[0]}
                </Text>
                <Text style={{ fontSize: 11, color: dk.textSecondary, display: "block", lineHeight: 1.3 }} ellipsis>
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
                  background: `${getRoleColor(p.role)}18`,
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
        <Text style={{ color: dk.textSecondary, fontSize: 13 }}>
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
        <Text style={{ color: dk.textSecondary, fontSize: 13 }}>{formatDateTime(val)}</Text>
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
        <Text style={{ color: dk.textSecondary, fontSize: 13 }}>{formatDateTime(val)}</Text>
      ),
      responsive: ["lg"],
    },
  ];

  return (
    <ConfigProvider theme={darkTheme}>
      <div className="admin-dark" style={{ minHeight: "100vh", background: dk.bg, position: "relative", overflow: "hidden" }}>
        {/* Background orbs */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.secondary}12 0%, transparent 70%)`,
            top: "-15%",
            right: "-10%",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.accent}0a 0%, transparent 70%)`,
            bottom: "-10%",
            left: "-5%",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            padding: "16px 24px",
            borderBottom: `1px solid ${dk.border}`,
            background: "rgba(15, 13, 11, 0.8)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
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
                background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 12px ${colors.secondary}30`,
              }}
            >
              <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>F</span>
            </div>
            <Title level={4} style={{ margin: 0, color: dk.text }}>
              Chats
            </Title>
          </div>

          <div style={{ flex: 1, maxWidth: 400 }}>
            <Input
              prefix={<SearchOutlined style={{ color: dk.textSecondary }} />}
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ borderRadius: 20 }}
            />
          </div>

          <Space>
            <Text style={{ color: dk.textSecondary, fontSize: 13 }}>
              {user?.displayName || user?.email}
            </Text>
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              style={{ color: dk.textSecondary }}
            />
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={logout}
              style={{ color: dk.textSecondary }}
            />
          </Space>
        </div>

        {/* Chat Table */}
        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
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

        <style>{`
          .admin-dark .ant-table-wrapper .ant-table {
            background: ${dk.surface} !important;
          }
          .admin-dark .ant-table-wrapper .ant-table-row:hover > td {
            background: ${dk.hover} !important;
          }
          .admin-dark .ant-pagination .ant-pagination-item a {
            color: ${dk.textSecondary} !important;
          }
          .admin-dark .ant-pagination .ant-pagination-item-active a {
            color: ${colors.secondary} !important;
          }
          .admin-dark .ant-empty-description {
            color: ${dk.textSecondary} !important;
          }
          .admin-dark .ant-select-selector {
            background: rgba(255,255,255,0.06) !important;
            border-color: ${dk.border} !important;
            color: ${dk.textSecondary} !important;
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <ChatsContent />
    </AuthGuard>
  );
}
