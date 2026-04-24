"use client";

import { useState, useRef, useCallback } from "react";
import { Button, Input, Upload, Dropdown } from "antd";
import {
  SendOutlined,
  PlusOutlined,
  PictureOutlined,
  FileOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { colors } from "@/lib/theme";

interface MessageInputProps {
  chatId: string;
  onSent: () => void;
}

export function MessageInput({ chatId, onSent }: MessageInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTypeRef = useRef<"image" | "attachment" | "video">("image");
  const lastTypingSent = useRef(0);

  const emitTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingSent.current < 2000) return;
    lastTypingSent.current = now;
    try { getSocket().emit("typing", { chatId }); } catch {}
  }, [chatId]);

  const sendTextMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    setText("");
    try {
      await api(`/chats/${chatId}/messages`, {
        method: "POST",
        body: JSON.stringify({ contentType: "text", content: { text: trimmed } }),
      });
      onSent();
    } catch {
      setText(trimmed);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await api<{ url: string }>("/uploads", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.success) return;

      await api(`/chats/${chatId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          contentType: uploadTypeRef.current,
          content: { url: uploadRes.data.url, name: file.name },
        }),
      });
      onSent();
    } finally {
      setSending(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = "";
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "image",
      icon: <PictureOutlined />,
      label: "Image",
      onClick: () => {
        uploadTypeRef.current = "image";
        fileInputRef.current?.click();
      },
    },
    {
      key: "video",
      icon: <VideoCameraOutlined />,
      label: "Video",
      onClick: () => {
        uploadTypeRef.current = "video";
        fileInputRef.current?.click();
      },
    },
    {
      key: "file",
      icon: <FileOutlined />,
      label: "File",
      onClick: () => {
        uploadTypeRef.current = "attachment";
        fileInputRef.current?.click();
      },
    },
  ];

  return (
    <div
      className="glass-strong"
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        padding: "12px 16px",
        borderTop: `1px solid ${colors.border}`,
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={onFileChange}
        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
      />

      <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="topLeft">
        <Button
          shape="circle"
          icon={<PlusOutlined />}
          style={{
            flexShrink: 0,
            border: `1px solid ${colors.border}`,
            color: colors.textSecondary,
          }}
        />
      </Dropdown>

      <Input.TextArea
        value={text}
        onChange={(e) => { setText(e.target.value); if (e.target.value) emitTyping(); }}
        onPressEnter={(e) => {
          if (!e.shiftKey) {
            e.preventDefault();
            sendTextMessage();
          }
        }}
        placeholder="Type a message..."
        maxLength={2000}
        showCount={{ formatter: ({ count, maxLength }) => <span style={{ fontSize: 11, color: colors.textSecondary }}>{count}/{maxLength}</span> }}
        autoSize={{ minRows: 1 }}
        style={{
          borderRadius: 20,
          resize: "none",
          border: `1px solid ${colors.border}`,
          padding: "8px 16px",
          color: colors.text,
        }}
      />

      <Button
        type="primary"
        shape="circle"
        icon={<SendOutlined />}
        loading={sending}
        onClick={sendTextMessage}
        disabled={!text.trim() && !sending}
        style={{ flexShrink: 0 }}
      />
    </div>
  );
}
