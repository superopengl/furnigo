"use client";

import { Avatar, Tooltip } from "antd";
import type { User } from "@furnigo/types";
import { toRelativeUrl } from "@/lib/url";

interface UserAvatarProps {
  user: Pick<User, "id" | "displayName" | "email" | "role" | "avatarUrl">;
  size?: number;
  tooltip?: boolean;
}

const PALETTE = [
  "#C4713B", "#B8963E", "#3D7A6B", "#5B6BAA", "#9B5EA5",
  "#C05555", "#4A8CB8", "#7B8A3E", "#D4885A", "#6A7B9E",
];

function hashColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

function getInitials(displayName: string | null, email: string): string {
  if (displayName) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  return email[0].toUpperCase();
}

function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function UserAvatar({ user, size = 32, tooltip = true }: UserAvatarProps) {
  const color = hashColor(user.id);
  const fontSize = Math.max(11, Math.round(size * 0.38));

  const tooltipContent = (
    <div style={{ lineHeight: 1.5 }}>
      <div style={{ fontWeight: 600 }}>{user.displayName || user.email.split("@")[0]}</div>
      <div style={{ opacity: 0.8 }}>{user.email}</div>
      <div style={{ opacity: 0.8 }}>{formatRole(user.role)}</div>
    </div>
  );

  const avatarSrc = user.avatarUrl ? toRelativeUrl(user.avatarUrl) : null;

  const avatar = avatarSrc ? (
    <Avatar size={size} src={avatarSrc} />
  ) : (
    <Avatar
      size={size}
      style={{
        backgroundColor: `${color}25`,
        color,
        fontSize,
        fontWeight: 600,
        cursor: "default",
      }}
    >
      {getInitials(user.displayName, user.email)}
    </Avatar>
  );

  if (!tooltip) return avatar;

  return (
    <Tooltip title={tooltipContent} placement="bottom">
      {avatar}
    </Tooltip>
  );
}
