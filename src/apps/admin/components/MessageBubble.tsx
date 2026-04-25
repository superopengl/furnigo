"use client";

import { Image, Typography } from "antd";
import { FileOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { colors } from "@/lib/theme";
import { UserAvatar } from "./UserAvatar";
import type { Message, UserRole } from "@furnigo/types";

const { Text } = Typography;

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  sender?: { id: string; displayName: string | null; email: string; role: UserRole; avatarUrl: string | null };
}

export function MessageBubble({ message: msg, isOwn, sender }: MessageBubbleProps) {
  const isSystem = msg.senderRole === "system";

  if (isSystem) {
    return (
      <div style={{ textAlign: "center", margin: "8px 0" }}>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          {(msg.content as any).text || "System message"}
        </Text>
      </div>
    );
  }

  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const renderContent = () => {
    switch (msg.contentType) {
      case "image":
        return (
          <Image
            src={msg.content.url as string}
            alt="image"
            style={{ maxWidth: 240, borderRadius: 8 }}
            preview={{ mask: null }}
          />
        );
      case "video":
        return (
          <a
            href={msg.content.url as string}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 8, color: isOwn ? colors.white : colors.text }}
          >
            <PlayCircleOutlined style={{ fontSize: 24 }} />
            <span>Video</span>
          </a>
        );
      case "attachment":
        return (
          <a
            href={msg.content.url as string}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 8, color: isOwn ? colors.white : colors.text }}
          >
            <FileOutlined style={{ fontSize: 18 }} />
            <span>{(msg.content.name as string) || "Attachment"}</span>
          </a>
        );
      default:
        return (
          <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {(msg.content as any).text || ""}
          </span>
        );
    }
  };

  const isText = msg.contentType === "text" || !msg.contentType;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isOwn ? "flex-end" : "flex-start",
        alignItems: "flex-end",
        gap: 8,
        margin: "4px 0",
        padding: "0 16px",
      }}
    >
      {!isOwn && sender && <UserAvatar user={sender} size={28} />}
      <div
        style={{
          maxWidth: "70%",
          ...(isText
            ? {
                padding: "10px 14px",
                borderRadius: 16,
                borderBottomRightRadius: isOwn ? 4 : 16,
                borderBottomLeftRadius: isOwn ? 16 : 4,
                background: isOwn ? colors.primary : "rgba(255,255,255,0.8)",
                color: isOwn ? colors.white : colors.text,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }
            : {}),
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        {renderContent()}
        <div
          style={{
            fontSize: 11,
            color: isOwn ? "rgba(255,255,255,0.6)" : colors.textSecondary,
            textAlign: "right",
            marginTop: 4,
          }}
        >
          {time}
        </div>
      </div>
    </div>
  );
}
