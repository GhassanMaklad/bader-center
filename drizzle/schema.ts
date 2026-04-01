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
  occasionKeys: text("occasionKeys"),                            // JSON array of occasion keys e.g. ["weddings","corporate"]
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Service requests submitted from the /request page.
 */
export const serviceRequests = mysqlTable("service_requests", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  occasion: varchar("occasion", { length: 64 }).notNull(),
  occasionLabel: varchar("occasionLabel", { length: 128 }).notNull(),
  date: varchar("date", { length: 20 }).notNull(),
  budget: varchar("budget", { length: 64 }).notNull(),
  budgetLabel: varchar("budgetLabel", { length: 128 }).notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["new", "contacted", "completed", "cancelled"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = typeof serviceRequests.$inferInsert;

/**
 * Orders table — WhatsApp-based order flow.
 * Customer submits order via WhatsApp; staff confirms and sends payment link manually.
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 30 }),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("KWD").notNull(),
  // pending = waiting for staff review, confirmed = staff confirmed via WhatsApp,
  // paid = payment received, cancelled = cancelled
  status: mysqlEnum("status", ["pending", "confirmed", "paid", "cancelled"]).default("pending").notNull(),
  // Cart snapshot (JSON)
  cartItems: text("cartItems").notNull(),                         // JSON array of {productId, name, qty, price}
  notes: text("notes"),
  adminNotes: text("adminNotes"),                                // Internal staff notes (not visible to customer)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Gallery items for the "أعمالنا" section on the homepage.
 * Managed via admin dashboard.
 */
export const galleryItems = mysqlTable("gallery_items", {
  id: int("id").autoincrement().primaryKey(),
  image: text("image").notNull(),           // CDN URL
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  span: varchar("span", { length: 100 }).default("col-span-1 row-span-1").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GalleryItem = typeof galleryItems.$inferSelect;
export type InsertGalleryItem = typeof galleryItems.$inferInsert;

/**
 * Service cards for the "خدماتنا" section on the homepage.
 * Managed via admin dashboard.
 */
export const serviceCards = mysqlTable("service_cards", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  features: text("features").notNull(),     // JSON array of strings
  bgGradient: varchar("bgGradient", { length: 255 }).default("linear-gradient(135deg, #B89050 0%, #9C7A3C 40%, #7A5C28 100%)").notNull(),
  iconColor: varchar("iconColor", { length: 20 }).default("#FFF3D0").notNull(),
  accentColor: varchar("accentColor", { length: 20 }).default("#F5E0A0").notNull(),
  image: text("image"),                     // Optional: override SVG icon with a photo
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceCard = typeof serviceCards.$inferSelect;
export type InsertServiceCard = typeof serviceCards.$inferInsert;

/**
 * Occasion photos for the "مناسباتنا" section on the homepage.
 * Each photo is linked to an occasion key (e.g. 'wedding', 'graduation').
 * Managed via admin dashboard with S3 upload.
 */
export const occasionPhotos = mysqlTable("occasion_photos", {
  id: int("id").autoincrement().primaryKey(),
  occasionKey: varchar("occasionKey", { length: 64 }).notNull(), // e.g. 'wedding', 'graduation'
  occasionLabel: varchar("occasionLabel", { length: 128 }).notNull(), // Arabic label e.g. 'حفلات الأعراس'
  imageUrl: text("imageUrl").notNull(),          // CDN URL from S3
  caption: varchar("caption", { length: 255 }),  // optional caption
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OccasionPhoto = typeof occasionPhotos.$inferSelect;
export type InsertOccasionPhoto = typeof occasionPhotos.$inferInsert;

/**
 * Occasions table — dynamic occasion types managed from admin dashboard.
 * Replaces the static hardcoded occasions list in OccasionsSection.
 */
export const occasions = mysqlTable("occasions", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(), // e.g. 'wedding', 'graduation'
  title: varchar("title", { length: 128 }).notNull(),     // Arabic name e.g. 'حفلات الأعراس'
  icon: varchar("icon", { length: 64 }).default("🎉").notNull(), // emoji icon
  desc: varchar("desc", { length: 255 }).default("").notNull(), // short description
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Occasion = typeof occasions.$inferSelect;
export type InsertOccasion = typeof occasions.$inferInsert;

/**
 * Product images table — multiple images per product.
 * The primary image lives on the products.image field;
 * additional gallery images are stored here.
 */
export const productImages = mysqlTable("product_images", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),   // FK → products.id
  imageUrl: text("imageUrl").notNull(),    // CDN URL from S3
  caption: varchar("caption", { length: 255 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = typeof productImages.$inferInsert;

/**
 * Announcements table — dynamic scrolling ticker on the homepage banner.
 * Managed via admin dashboard (add / edit / delete / enable / reorder).
 */
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  icon: varchar("icon", { length: 16 }).default("✨").notNull(),   // emoji
  text: varchar("text", { length: 300 }).notNull(),               // Arabic announcement text
  cta: varchar("cta", { length: 50 }).default("").notNull(),       // CTA button label (empty = no button)
  ctaLink: varchar("ctaLink", { length: 255 }).default("/request").notNull(), // CTA destination
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;


/**
 * Testimonials table — customer reviews displayed on the About page and homepage.
 * Managed via admin dashboard.
 */
export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),           // customer name
  position: varchar("position", { length: 150 }),             // e.g. "مدير شركة الخليج"
  text: text("text").notNull(),                               // testimonial body
  rating: int("rating").default(5).notNull(),                 // 1–5 stars
  avatarUrl: text("avatarUrl"),                               // optional CDN URL
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;
