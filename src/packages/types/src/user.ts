export type UserRole = "client" | "agent" | "admin";

export interface User {
  id: string;
  role: UserRole;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  locale: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
