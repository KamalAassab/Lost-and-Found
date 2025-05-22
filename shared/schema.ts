import { mysqlTable, text, int, boolean, timestamp, decimal, varchar, mysqlEnum } from 'drizzle-orm/mysql-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Enums as string literals for MySQL
const PRODUCT_CATEGORIES = ['hoodies', 'tshirts'] as const;
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
const PAYMENT_METHODS = ['cash_on_delivery', 'credit_card'] as const;

// Tables
export const categories = mysqlTable('categories', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  backgroundImageUrl: varchar('background_image_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const products = mysqlTable('products', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description').notNull(),
  image: varchar('image', { length: 255 }).notNull(),
  price: int('price').notNull(),
  oldPrice: int('old_price'),
  category: varchar('category', { length: 10, enum: PRODUCT_CATEGORIES }).notNull(),
  categoryId: int('category_id').references(() => categories.id).notNull(),
  inStock: boolean('in_stock').default(true).notNull(),
  sizes: varchar('sizes', { length: 255 }).notNull(),
  featured: boolean('featured').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 30 }),
  address: varchar('address', { length: 255 }),
  fullname: varchar('fullname', { length: 255 }),
  city: varchar('city', { length: 255 }),
  postalCode: varchar('postal_code', { length: 20 }),
  password: varchar('password', { length: 255 }).notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const orders = mysqlTable('orders', {
  id: int('id').primaryKey().autoincrement(),
  status: mysqlEnum('status', ORDER_STATUSES).default('pending').notNull(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 255 }).notNull(),
  shippingAddress: varchar('shipping_address', { length: 255 }).notNull(),
  city: varchar('city', { length: 255 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 20, enum: PAYMENT_METHODS }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  free_shipping: boolean('free_shipping').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const orderItems = mysqlTable('order_items', {
  id: int('id').primaryKey().autoincrement(),
  orderId: int('order_id').references(() => orders.id).notNull(),
  productId: int('product_id').references(() => products.id).notNull(),
  quantity: int('quantity').notNull(),
  size: varchar('size', { length: 10 }).notNull(),
  price: int('price').notNull(),
  isFree: boolean('is_free').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const wishlists = mysqlTable('wishlists', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  productId: int('product_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Messages table
export const messages = mysqlTable('messages', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products)
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] })
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems)
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] })
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, { fields: [wishlists.userId], references: [users.id] }),
  product: one(products, { fields: [wishlists.productId], references: [products.id] }),
}));

// Schemas for validation
export const categoriesInsertSchema = createInsertSchema(categories, {
  name: (schema) => schema.min(2, "Le nom doit comporter au moins 2 caractères"),
  slug: (schema) => schema.min(2, "Le slug doit comporter au moins 2 caractères"),
  backgroundImageUrl: (schema) => schema.optional(),
});
export type CategoryInsert = z.infer<typeof categoriesInsertSchema>;
export type Category = typeof categories.$inferSelect;

export const productsInsertSchema = createInsertSchema(products, {
  name: (schema) => schema.min(3, "Le nom doit comporter au moins 3 caractères"),
  description: (schema) => schema.min(10, "La description doit comporter au moins 10 caractères"),
  price: (schema) => schema.refine(val => Number.isInteger(typeof val === 'string' ? parseFloat(val) : val) && (typeof val === 'string' ? parseInt(val) > 0 : val > 0), "Le prix doit être un entier positif"),
  slug: (schema) => schema.min(3, "Le slug doit comporter au moins 3 caractères"),
  image: z.string(),
});
export type ProductInsert = z.infer<typeof productsInsertSchema>;
export type Product = typeof products.$inferSelect;

export const usersInsertSchema = createInsertSchema(users, {
  username: (schema) => schema.min(4, "Le nom d'utilisateur doit comporter au moins 4 caractères"),
  password: (schema) => schema.min(8, "Le mot de passe doit comporter au moins 8 caractères"),
});
export type UserInsert = z.infer<typeof usersInsertSchema>;
export type User = typeof users.$inferSelect;

export const ordersInsertSchema = createInsertSchema(orders, {
  customerName: (schema) => schema.min(3, "Le nom doit comporter au moins 3 caractères"),
  customerEmail: (schema) => schema.email("Veuillez fournir un e-mail valide"),
  customerPhone: (schema) => schema.min(8, "Le numéro de téléphone doit comporter au moins 8 caractères"),
  shippingAddress: (schema) => schema.min(5, "L'adresse doit comporter au moins 5 caractères"),
  city: (schema) => schema.min(2, "La ville doit comporter au moins 2 caractères"),
});
export type OrderInsert = z.infer<typeof ordersInsertSchema>;
export type Order = typeof orders.$inferSelect;

export const orderItemsInsertSchema = createInsertSchema(orderItems, {
  quantity: (schema) => schema.refine(val => typeof val === 'string' ? parseInt(val) > 0 : val > 0, "La quantité doit être supérieure à 0"),
});
export type OrderItemInsert = z.infer<typeof orderItemsInsertSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Extended schemas for API
export const cartItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().positive(),
  size: z.string(),
  price: z.number().positive(),
  name: z.string(),
  imageUrl: z.string(),
});
export type CartItem = z.infer<typeof cartItemSchema>;

export const checkoutSchema = z.object({
  customerName: z.string().min(3, "Le nom doit comporter au moins 3 caractères"),
  customerEmail: z.string().email("Veuillez fournir un e-mail valide"),
  customerPhone: z.string().min(8, "Le numéro de téléphone doit comporter au moins 8 caractères"),
  shippingAddress: z.string().min(5, "L'adresse doit comporter au moins 5 caractères"),
  city: z.string().min(2, "La ville doit comporter au moins 2 caractères"),
  postalCode: z.string().min(5, "Le code postal doit comporter au moins 5 caractères"),
  paymentMethod: z.enum(PAYMENT_METHODS),
  items: z.array(cartItemSchema),
});
export type CheckoutData = z.infer<typeof checkoutSchema>;

export const messagesInsertSchema = createInsertSchema(messages, {
  name: (schema) => schema.min(2, "Le nom doit comporter au moins 2 caractères"),
  email: (schema) => schema.email("Veuillez fournir un e-mail valide"),
  subject: (schema) => schema.min(2, "Le sujet doit comporter au moins 2 caractères"),
  message: (schema) => schema.min(5, "Le message doit comporter au moins 5 caractères"),
});
export type MessageInsert = z.infer<typeof messagesInsertSchema>;
export type Message = typeof messages.$inferSelect;
