import {
  mysqlTable,
  serial,
  text,
  longtext,
  json,
  timestamp,
} from "drizzle-orm/mysql-core";

export const tylerKnowledge = mysqlTable("tylerknowledge", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: longtext("body").notNull(),
  tags: json("tags"), // optional JSON array like ["billing","refunds"]
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
