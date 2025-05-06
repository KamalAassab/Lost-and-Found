import { db } from '@db';
import * as schema from '@shared/schema';
import { eq, and, desc, like, asc, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Categories
export const getAllCategories = async () => {
  return await db.query.categories.findMany({
    orderBy: asc(schema.categories.name),
  });
};

export const getCategoryBySlug = async (slug: string) => {
  return await db.query.categories.findFirst({
    where: eq(schema.categories.slug, slug),
  });
};

export const createCategory = async (data: schema.CategoryInsert) => {
  const [category] = await db.insert(schema.categories).values(data).returning();
  return category;
};

export const updateCategory = async (id: number, data: Partial<schema.CategoryInsert>) => {
  const [category] = await db
    .update(schema.categories)
    .set(data)
    .where(eq(schema.categories.id, id))
    .returning();
  return category;
};

export const deleteCategory = async (id: number) => {
  const [category] = await db
    .delete(schema.categories)
    .where(eq(schema.categories.id, id))
    .returning();
  return category;
};

// Products
export const getAllProducts = async (
  category?: string,
  search?: string,
  featured?: boolean
) => {
  let query = db.select().from(schema.products);

  if (category) {
    query = query.where(eq(schema.products.category, category as any));
  }

  if (search) {
    query = query.where(
      or(
        like(schema.products.name, `%${search}%`),
        like(schema.products.description, `%${search}%`)
      )
    );
  }

  if (featured !== undefined) {
    query = query.where(eq(schema.products.featured, featured));
  }

  return await query.orderBy(desc(schema.products.createdAt));
};

export const getProductBySlug = async (slug: string) => {
  return await db.query.products.findFirst({
    where: eq(schema.products.slug, slug),
    with: {
      category: true,
    },
  });
};

export const getProductById = async (id: number) => {
  return await db.query.products.findFirst({
    where: eq(schema.products.id, id),
    with: {
      category: true,
    },
  });
};

export const createProduct = async (data: schema.ProductInsert) => {
  const [product] = await db.insert(schema.products).values(data).returning();
  return product;
};

export const updateProduct = async (id: number, data: Partial<schema.ProductInsert>) => {
  const [product] = await db
    .update(schema.products)
    .set(data)
    .where(eq(schema.products.id, id))
    .returning();
  return product;
};

export const deleteProduct = async (id: number) => {
  const [product] = await db
    .delete(schema.products)
    .where(eq(schema.products.id, id))
    .returning();
  return product;
};

// Users
export const getUserByUsername = async (username: string) => {
  return await db.query.users.findFirst({
    where: eq(schema.users.username, username),
  });
};

export const createUser = async (data: schema.UserInsert) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const [user] = await db
    .insert(schema.users)
    .values({
      ...data,
      password: hashedPassword,
    })
    .returning();
  return user;
};

// Orders
export const createOrder = async (
  orderData: Omit<schema.OrderInsert, 'id'>,
  orderItems: Omit<schema.OrderItemInsert, 'id' | 'orderId'>[]
) => {
  const [order] = await db.insert(schema.orders).values(orderData).returning();

  const itemsWithOrderId = orderItems.map((item) => ({
    ...item,
    orderId: order.id,
  }));

  await db.insert(schema.orderItems).values(itemsWithOrderId);

  return order;
};

export const getAllOrders = async () => {
  return await db.query.orders.findMany({
    orderBy: desc(schema.orders.createdAt),
  });
};

export const getOrderById = async (id: number) => {
  return await db.query.orders.findFirst({
    where: eq(schema.orders.id, id),
    with: {
      items: {
        with: {
          product: true,
        },
      },
    },
  });
};

export const updateOrderStatus = async (id: number, status: schema.Order['status']) => {
  const [order] = await db
    .update(schema.orders)
    .set({ status })
    .where(eq(schema.orders.id, id))
    .returning();
  return order;
};

// Subscribers
export const addSubscriber = async (email: string) => {
  try {
    const [subscriber] = await db
      .insert(schema.subscribers)
      .values({ email })
      .returning();
    return subscriber;
  } catch (error) {
    // Handle unique constraint violation
    if ((error as any).code === '23505') {
      return { error: 'Cette adresse e-mail est déjà inscrite' };
    }
    throw error;
  }
};

// Calculate promotional discounts
export const calculatePromotions = (items: { productId: number; quantity: number; size: string; price: number; name: string; category: string }[]) => {
  const result = [...items];
  const hoodieItems = items.filter(item => item.category === 'hoodie').sort((a, b) => b.price - a.price);
  const tshirtItems = items.filter(item => item.category === 'tshirt').sort((a, b) => b.price - a.price);
  
  // Apply "3 hoodies + 1 free" promotion
  const freeHoodiesCount = Math.floor(hoodieItems.reduce((sum, item) => sum + item.quantity, 0) / 4);
  let remainingFreeHoodies = freeHoodiesCount;
  
  // Apply "2 tshirts + 1 free" promotion
  const freeTshirtsCount = Math.floor(tshirtItems.reduce((sum, item) => sum + item.quantity, 0) / 3);
  let remainingFreeTshirts = freeTshirtsCount;
  
  // Mark items as free
  for (let i = 0; i < result.length; i++) {
    const item = result[i];
    if (item.category === 'hoodie' && remainingFreeHoodies > 0) {
      const freeCount = Math.min(item.quantity, remainingFreeHoodies);
      if (freeCount > 0) {
        item.isFree = true;
        item.freeCount = freeCount;
        remainingFreeHoodies -= freeCount;
      }
    } else if (item.category === 'tshirt' && remainingFreeTshirts > 0) {
      const freeCount = Math.min(item.quantity, remainingFreeTshirts);
      if (freeCount > 0) {
        item.isFree = true;
        item.freeCount = freeCount;
        remainingFreeTshirts -= freeCount;
      }
    }
  }
  
  return {
    items: result,
    freeHoodiesCount,
    freeTshirtsCount,
    promoApplied: freeHoodiesCount > 0 || freeTshirtsCount > 0
  };
};

// Calculate totals
export const calculateOrderTotal = (items: { quantity: number; price: number; isFree?: boolean; freeCount?: number }[]) => {
  let total = 0;
  
  for (const item of items) {
    if (item.isFree && item.freeCount) {
      total += (item.quantity - item.freeCount) * item.price;
    } else {
      total += item.quantity * item.price;
    }
  }
  
  return total;
};

// Check if shipping is free
export const isShippingFree = (total: number) => {
  return total >= 500;
};
