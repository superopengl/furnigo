"use client";

import { Image, Typography } from "antd";
import { FileOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { colors } from "@/lib/theme";
import type { Message } from "@furnigo/types";

const { Text } = Typography;

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message: msg, isOwn }: MessageBubbleProps) {
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

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isOwn ? "flex-end" : "flex-start",
        margin: "4px 0",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          maxWidth: "75%",
          padding: msg.contentType === "image" ? 4 : "10px 14px",
          borderRadius: 16,
          borderBottomRightRadius: isOwn ? 4 : 16,
          borderBottomLeftRadius: isOwn ? 16 : 4,
          background: isOwn ? colors.primary : "rgba(255,255,255,0.8)",
          color: isOwn ? colors.white : colors.text,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
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
