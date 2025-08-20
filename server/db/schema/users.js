import {
  mysqlTable,
  serial,
  int,
  varchar,
  timestamp,
  mysqlEnum,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    emailUnique: uniqueIndex("users_email_unique").on(t.email),
  })
);

export const userConversations = mysqlTable(
  "user_conversations",
  {
    id: serial("id").primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    history: varchar("history", { length: 8192 }).notNull(),
    categories: varchar("categories", { length: 255 }),
    style: varchar("style", { length: 255 }),
  },
  (t) => ({
    userIdx: uniqueIndex("user_conversations_user_idx").on(
      t.userId,
      t.startedAt
    ),
  })
);
