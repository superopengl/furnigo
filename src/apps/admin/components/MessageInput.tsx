"use client";

import { useState, useRef, useCallback } from "react";
import { Button, Input, Dropdown, Image } from "antd";
import {
  SendOutlined,
  PlusOutlined,
  PictureOutlined,
  FileOutlined,
  VideoCameraOutlined,
  CloseOutlined,
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
  const [pastedImages, setPastedImages] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTypeRef = useRef<"image" | "attachment" | "video">("image");
  const lastTypingSent = useRef(0);

  const emitTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingSent.current < 2000) return;
    lastTypingSent.current = now;
    try { getSocket().emit("typing", { chatId }); } catch {}
  }, [chatId]);

  const uploadAndSendImage = async (file: File) => {
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
        contentType: "image",
        content: { url: uploadRes.data.url, name: file.name },
      }),
    });
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && pastedImages.length === 0) return;
    setSending(true);
    setText("");
    const imagesToSend = [...pastedImages];
    setPastedImages([]);
    try {
      // Send pasted images first
      for (const img of imagesToSend) {
        await uploadAndSendImage(img);
      }
      // Then send text if any
      if (trimmed) {
        await api(`/chats/${chatId}/messages`, {
          method: "POST",
          body: JSON.stringify({ contentType: "text", content: { text: trimmed } }),
        });
      }
      onSent();
    } catch {
      if (trimmed) setText(trimmed);
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

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const images: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) images.push(file);
      }
    }
    if (images.length > 0) {
      e.preventDefault();
      setPastedImages((prev) => [...prev, ...images]);
    }
  };

  const removePastedImage = (index: number) => {
    setPastedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const isAcceptedType = (file: File) =>
    file.type.startsWith("image/") || file.type.startsWith("video/") || file.type === "application/pdf";

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(isAcceptedType);
    const images = files.filter((f) => f.type.startsWith("image/"));
    const others = files.filter((f) => !f.type.startsWith("image/"));
    if (images.length > 0) setPastedImages((prev) => [...prev, ...images]);
    for (const file of others) handleFileUpload(file);
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
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        borderTop: `1px solid ${dragging ? colors.primary : colors.border}`,
        transition: "border-color 0.2s",
      }}
    >
      {/* Pasted image previews */}
      {pastedImages.length > 0 && (
        <div style={{ display: "flex", gap: 8, padding: "8px 16px 0", flexWrap: "wrap" }}>
          {pastedImages.map((img, i) => (
            <div key={i} style={{ position: "relative" }}>
              <Image
                src={URL.createObjectURL(img)}
                alt="pasted"
                width={64}
                height={64}
                style={{ borderRadius: 8, objectFit: "cover" }}
                preview={false}
              />
              <div
                onClick={() => removePastedImage(i)}
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: colors.error,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <CloseOutlined style={{ fontSize: 10, color: "#fff" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          padding: "12px 16px",
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
              handleSend();
            }
          }}
          onPaste={handlePaste}
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
          onClick={handleSend}
          disabled={!text.trim() && pastedImages.length === 0 && !sending}
          style={{ flexShrink: 0 }}
        />
      </div>
    </div>
  );
}
