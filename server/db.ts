import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { announcements, galleryItems, InsertAnnouncement, InsertGalleryItem, InsertOccasion, InsertOccasionPhoto, InsertOrder, InsertProduct, InsertProductImage, InsertServiceCard, InsertServiceRequest, InsertTestimonial, InsertUser, occasionPhotos, occasions, orders, productImages, products, serviceCards, serviceRequests, testimonials, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Product Queries ─────────────────────────────────────────────────────────

export async function getAllProducts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.select().from(products).orderBy(asc(products.sortOrder));
  // Attach gallery images to each product
  const allImages = await db.select().from(productImages).orderBy(asc(productImages.sortOrder));
  return rows.map((p) => ({
    ...p,
    galleryImages: allImages.filter((img) => img.productId === p.id),
  }));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  const product = result[0] ?? null;
  if (!product) return null;
  const images = await db.select().from(productImages)
    .where(eq(productImages.productId, id))
    .orderBy(asc(productImages.sortOrder));
  return { ...product, galleryImages: images };
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(products).values(data);
  return result;
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

export async function toggleProductStock(id: number, inStock: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ inStock }).where(eq(products.id, id));
}

// ─── Product Images Queries ───────────────────────────────────────────────────

export async function getProductImages(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(asc(productImages.sortOrder));
}

export async function createProductImage(data: InsertProductImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(productImages).values(data);
  return result;
}

export async function deleteProductImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(productImages).where(eq(productImages.id, id));
}

export async function getRelatedProducts(productId: number, category: string, occasionKeys: string | null, limit = 4) {
  const db = await getDb();
  if (!db) return [];
  // Get products in same category, excluding current product
  const results = await db.select().from(products)
    .where(eq(products.category, category as "gifts" | "shields" | "catering" | "occasions" | "calligraphy"))
    .orderBy(asc(products.sortOrder))
    .limit(limit + 1);
  return results.filter(p => p.id !== productId).slice(0, limit);
}

// ─── Service Request Queries ──────────────────────────────────────────────────

export async function createServiceRequest(data: InsertServiceRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(serviceRequests).values(data);
  return result;
}

export async function getAllServiceRequests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(serviceRequests).orderBy(desc(serviceRequests.createdAt));
}

export async function updateServiceRequestStatus(
  id: number,
  status: "new" | "contacted" | "completed" | "cancelled"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(serviceRequests).set({ status }).where(eq(serviceRequests.id, id));
}

// ─── Order Queries ────────────────────────────────────────────────────────────

export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(orders).values(data);
  return result;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0] ?? null;
}

export async function updateOrderStatus(
  id: number,
  status: "pending" | "confirmed" | "paid" | "cancelled"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ status }).where(eq(orders.id, id));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

// ─── Gallery Item Queries ───────────────────────────────────────────────────────────────

export async function getAllGalleryItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(galleryItems).orderBy(asc(galleryItems.sortOrder));
}

export async function createGalleryItem(data: InsertGalleryItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(galleryItems).values(data);
  return result;
}

export async function updateGalleryItem(id: number, data: Partial<InsertGalleryItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(galleryItems).set(data).where(eq(galleryItems.id, id));
}

export async function deleteGalleryItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(galleryItems).where(eq(galleryItems.id, id));
}

// ─── Service Card Queries ──────────────────────────────────────────────────────────────

export async function getAllServiceCards() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(serviceCards).orderBy(asc(serviceCards.sortOrder));
}

export async function createServiceCard(data: InsertServiceCard) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(serviceCards).values(data);
  return result;
}

export async function updateServiceCard(id: number, data: Partial<InsertServiceCard>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(serviceCards).set(data).where(eq(serviceCards.id, id));
}

export async function deleteServiceCard(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(serviceCards).where(eq(serviceCards.id, id));
}

// ─── Occasion Queries ────────────────────────────────────────────────────────────────────────────────────────

export async function getAllOccasions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(occasions).orderBy(asc(occasions.sortOrder));
}

// nameAr is now 'title' in the schema
export async function createOccasion(data: InsertOccasion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(occasions).values(data);
  return result;
}

export async function updateOccasion(id: number, data: Partial<InsertOccasion>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(occasions).set(data).where(eq(occasions.id, id));
}

export async function deleteOccasion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(occasions).where(eq(occasions.id, id));
}

// ─── Occasion Photo Queries ────────────────────────────────────────────────────────────────────────────────────────

export async function getOccasionPhotos(occasionKey?: string) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(occasionPhotos)
    .where(occasionKey ? eq(occasionPhotos.occasionKey, occasionKey) : undefined)
    .orderBy(asc(occasionPhotos.sortOrder), asc(occasionPhotos.id));
  return query;
}

export async function createOccasionPhoto(data: InsertOccasionPhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(occasionPhotos).values(data);
  return result;
}

export async function updateOccasionPhoto(id: number, data: Partial<InsertOccasionPhoto>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(occasionPhotos).set(data).where(eq(occasionPhotos.id, id));
}

export async function deleteOccasionPhoto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(occasionPhotos).where(eq(occasionPhotos.id, id));
}

// ─── Announcements ───────────────────────────────────────────────────────────

export async function getAllAnnouncements() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(announcements).orderBy(announcements.sortOrder, announcements.id);
}

export async function getActiveAnnouncements() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(announcements)
    .where(eq(announcements.isActive, true))
    .orderBy(announcements.sortOrder, announcements.id);
}

export async function createAnnouncement(data: InsertAnnouncement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(announcements).values(data);
}

export async function updateAnnouncement(id: number, data: Partial<InsertAnnouncement>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(announcements).set(data).where(eq(announcements.id, id));
}

export async function deleteAnnouncement(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(announcements).where(eq(announcements.id, id));
}

// ── Testimonials ─────────────────────────────────────────────────────────────
export async function getActiveTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials)
    .where(eq(testimonials.isActive, true))
    .orderBy(testimonials.sortOrder, testimonials.id);
}
export async function getAllTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials).orderBy(testimonials.sortOrder, testimonials.id);
}
export async function createTestimonial(data: InsertTestimonial) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(testimonials).values(data);
}
export async function updateTestimonial(id: number, data: Partial<InsertTestimonial>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(testimonials).set(data).where(eq(testimonials.id, id));
}
export async function deleteTestimonial(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(testimonials).where(eq(testimonials.id, id));
}
