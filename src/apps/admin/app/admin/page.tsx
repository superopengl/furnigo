"use client";

import { useState, useEffect } from "react";
import { Typography, Input, Button, Tag, Table, ConfigProvider, Dropdown, Modal, Upload, theme as antTheme } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  LogoutOutlined,
  ReloadOutlined,
  SettingOutlined,
  CameraOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { getSocket } from "@/lib/socket";
import { AuthGuard } from "@/components/AuthGuard";
import { ChatDrawer } from "@/components/ChatDrawer";
import { UserAvatar } from "@/components/UserAvatar";
import { colors } from "@/lib/theme";
import { Logo } from "@/components/Logo";
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
  const [modal, contextHolder] = Modal.useModal();
  const { user, logout } = useAuth();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const { data: chats, isLoading, refetch } = useQuery({
    queryKey: ["admin-chats"],
    queryFn: async () => {
      const res = await api<ChatListItem[]>("/admin/chats");
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    },
    refetchInterval: 30_000,
  });

  // Real-time: refetch chat list when any chat gets a new message
  useEffect(() => {
    const socket = getSocket();
    const handler = () => { refetch(); };
    socket.on("chat:updated", handler);
    return () => { socket.off("chat:updated", handler); };
  }, [refetch]);

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
      title: "Clients",
      key: "clients",
      render: (_, record) => {
        const clients = record.participants.filter((p) => p.role === "client");
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {clients.map((p) => (
              <div key={p.userId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <UserAvatar
                  user={{ id: p.userId, displayName: p.displayName, email: p.email, role: p.role as any, avatarUrl: p.avatarUrl }}
                  size={36}
                />
                <div style={{ minWidth: 0 }}>
                  <Text style={{ fontSize: 13, color: dk.text, display: "block", lineHeight: 1.3 }} ellipsis>
                    {p.displayName || p.email.split("@")[0]}
                  </Text>
                  <Text style={{ fontSize: 11, color: dk.textSecondary, display: "block", lineHeight: 1.3 }} ellipsis>
                    {p.email}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        );
      },
      responsive: ["md"],
    },
    {
      title: "Agents",
      key: "agents",
      render: (_, record) => {
        const agents = record.participants.filter((p) => p.role !== "client");
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {agents.map((p) => (
              <div key={p.userId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <UserAvatar
                  user={{ id: p.userId, displayName: p.displayName, email: p.email, role: p.role as any, avatarUrl: p.avatarUrl }}
                  size={36}
                />
                <div style={{ minWidth: 0 }}>
                  <Text style={{ fontSize: 13, color: dk.text, display: "block", lineHeight: 1.3 }} ellipsis>
                    {p.displayName || p.email.split("@")[0]}
                  </Text>
                  <Text style={{ fontSize: 11, color: dk.textSecondary, display: "block", lineHeight: 1.3 }} ellipsis>
                    {p.email}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        );
      },
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
      {contextHolder}
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
            <Logo size={36} />
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

          {user && (
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              popupRender={() => (
                <div style={{ background: dk.surface, border: `1px solid ${dk.border}`, borderRadius: 12, padding: "12px 0", minWidth: 220 }}>
                  <div style={{ padding: "8px 16px 12px", borderBottom: `1px solid ${dk.border}` }}>
                    <Text strong style={{ color: dk.text, display: "block" }}>{user.displayName || user.email.split("@")[0]}</Text>
                    <Text style={{ color: dk.textSecondary, fontSize: 12, display: "block" }}>{user.email}</Text>
                    <Text style={{ color: dk.textSecondary, fontSize: 11, display: "block", marginTop: 2 }}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Text>
                  </div>
                  <div style={{ padding: "4px 8px" }}>
                    <Button
                      type="text"
                      icon={<SettingOutlined />}
                      block
                      style={{ color: dk.text, textAlign: "left", justifyContent: "flex-start" }}
                      onClick={() => { setEditName(user.displayName || ""); setEditAvatarUrl(null); setSettingsOpen(true); }}
                    >
                      Settings
                    </Button>
                    <div style={{ borderTop: `1px solid ${dk.border}`, margin: "4px 0" }} />
                    <Button
                      type="text"
                      icon={<LogoutOutlined />}
                      block
                      danger
                      style={{ textAlign: "left", justifyContent: "flex-start" }}
                      onClick={() => modal.confirm({
                        title: "Log out",
                        content: "Are you sure you want to log out?",
                        okText: "Log out",
                        okButtonProps: { danger: true },
                        onOk: logout,
                      })}
                    >
                      Log out
                    </Button>
                  </div>
                </div>
              )}
            >
              <div style={{ cursor: "pointer" }}>
                <UserAvatar
                  user={{ id: user.id, displayName: user.displayName ?? null, email: user.email, role: user.role as any, avatarUrl: user.avatarUrl }}
                  size={32}
                  tooltip={false}
                />
              </div>
            </Dropdown>
          )}
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
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            style={{ color: dk.textSecondary, marginTop: 8 }}
          >
            Refresh
          </Button>
        </div>

        <ChatDrawer chatId={activeChatId} onClose={() => setActiveChatId(null)} />

        <Modal
          title="Settings"
          open={settingsOpen}
          onCancel={() => setSettingsOpen(false)}
          confirmLoading={savingName}
          onOk={async () => {
            const trimmed = editName.trim();
            if (!trimmed) return;
            setSavingName(true);
            try {
              await api("/users/me", {
                method: "PUT",
                body: JSON.stringify({ displayName: trimmed }),
              });
              window.location.reload();
            } finally {
              setSavingName(false);
            }
          }}
          okText="Save"
        >
          {/* Avatar upload */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Upload
              showUploadList={false}
              accept="image/*"
              beforeUpload={async (file) => {
                setUploadingAvatar(true);
                try {
                  const formData = new FormData();
                  formData.append("file", file);
                  const uploadRes = await api<{ url: string }>("/uploads", { method: "POST", body: formData });
                  if (uploadRes.success) {
                    const avatarUrl = uploadRes.data.url;
                    await api("/users/me", { method: "PUT", body: JSON.stringify({ avatarUrl }) });
                    setEditAvatarUrl(avatarUrl);
                  }
                } finally {
                  setUploadingAvatar(false);
                }
                return false;
              }}
            >
              <div style={{ cursor: "pointer", position: "relative", display: "inline-block" }}>
                <UserAvatar
                  user={{ id: user!.id, displayName: user!.displayName ?? null, email: user!.email, role: user!.role as any, avatarUrl: editAvatarUrl }}
                  size={80}
                  tooltip={false}
                />
                <div style={{
                  position: "absolute", right: 0, bottom: 0,
                  width: 24, height: 24, borderRadius: 8,
                  background: colors.secondary, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {uploadingAvatar ? <LoadingOutlined style={{ color: "#fff", fontSize: 12 }} /> : <CameraOutlined style={{ color: "#fff", fontSize: 12 }} />}
                </div>
              </div>
            </Upload>
          </div>

          <div style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: dk.textSecondary }}>Display Name</Text>
          </div>
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Enter display name"
          />
        </Modal>

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
