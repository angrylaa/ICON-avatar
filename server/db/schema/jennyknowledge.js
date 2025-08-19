import {
  mysqlTable,
  serial,
  text,
  longtext,
  json,
  timestamp,
} from "drizzle-orm/mysql-core";

export const jennyKnowledge = mysqlTable("jennyknowledge", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: longtext("body").notNull(),
  tags: json("tags"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
