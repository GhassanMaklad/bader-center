import { boolean, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table for the Bader Center catalog.
 * Managed via the admin dashboard.
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }).default(""),
  category: mysqlEnum("category", ["gifts", "shields", "catering", "occasions", "calligraphy"]).notNull(),
  price: varchar("price", { length: 100 }).notNull(),        // display string e.g. "من 45 د.ك"
  priceValue: decimal("priceValue", { precision: 10, scale: 2 }).default("0"), // numeric for sorting
  priceNote: varchar("priceNote", { length: 100 }),
  image: text("image").notNull(),                             // CDN URL
  badge: varchar("badge", { length: 50 }),
  badgeColor: varchar("badgeColor", { length: 20 }),
  description: text("description").notNull(),
  rating: int("rating").default(5).notNull(),
  inStock: boolean("inStock").default(true).notNull(),
  tags: text("tags"),                                          // JSON array stored as text (nullable)
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
