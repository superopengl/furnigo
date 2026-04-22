import {
  pgSchema,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";

export const schema = pgSchema("furnigo");

export const user = schema.table("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  role: varchar("role", { length: 20 }).notNull(),
  email: text("email").unique().notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  locale: varchar("locale", { length: 10 }).default("en-AU"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const otpCode = schema.table("otp_code", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chat = schema.table("chat", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chatParticipant = schema.table(
  "chat_participant",
  {
    chatId: uuid("chat_id").notNull().references(() => chat.id),
    userId: uuid("user_id").notNull().references(() => user.id),
    role: varchar("role", { length: 20 }).notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.chatId, table.userId] })],
);

export const message = schema.table("message", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatId: uuid("chat_id").notNull().references(() => chat.id),
  senderId: uuid("sender_id").references(() => user.id),
  senderRole: varchar("sender_role", { length: 20 }).notNull(),
  contentType: varchar("content_type", { length: 20 }).notNull(),
  content: jsonb("content").notNull(),
  label: text("label").array(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
