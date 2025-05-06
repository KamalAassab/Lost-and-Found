import { pgTable, text, serial, integer, boolean, timestamp, decimal, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Enums
export const productCategoryEnum = pgEnum('product_category', ['hoodie', 'tshirt']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash_on_delivery', 'credit_card']);

// Tables
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  oldPrice: decimal('old_price', { precision: 10, scale: 2 }),
  category: productCategoryEnum('category').notNull(),
  categoryId: integer('category_id').references(() => categories.id).notNull(),
  inStock: boolean('in_stock').default(true).notNull(),
  sizes: text('sizes').array().notNull(),
  featured: boolean('featured').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  status: orderStatusEnum('status').default('pending').notNull(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  city: text('city').notNull(),
  postalCode: text('postal_code').notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  freeShipping: boolean('free_shipping').default(false).notNull(),
  promoApplied: boolean('promo_applied').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
  size: text('size').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  isFree: boolean('is_free').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const subscribers = pgTable('subscribers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull()
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

// Schemas for validation
export const categoriesInsertSchema = createInsertSchema(categories, {
  name: (schema) => schema.min(2, "Le nom doit comporter au moins 2 caractères"),
  slug: (schema) => schema.min(2, "Le slug doit comporter au moins 2 caractères"),
});
export type CategoryInsert = z.infer<typeof categoriesInsertSchema>;
export type Category = typeof categories.$inferSelect;

export const productsInsertSchema = createInsertSchema(products, {
  name: (schema) => schema.min(3, "Le nom doit comporter au moins 3 caractères"),
  description: (schema) => schema.min(10, "La description doit comporter au moins 10 caractères"),
  price: (schema) => schema.refine(val => typeof val === 'string' ? parseFloat(val) > 0 : val > 0, "Le prix doit être positif"),
  slug: (schema) => schema.min(3, "Le slug doit comporter au moins 3 caractères"),
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

export const subscribersInsertSchema = createInsertSchema(subscribers, {
  email: (schema) => schema.email("Veuillez fournir un e-mail valide"),
});
export type SubscriberInsert = z.infer<typeof subscribersInsertSchema>;
export type Subscriber = typeof subscribers.$inferSelect;

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
  paymentMethod: z.enum(['cash_on_delivery', 'credit_card']),
  items: z.array(cartItemSchema),
});
export type CheckoutData = z.infer<typeof checkoutSchema>;
