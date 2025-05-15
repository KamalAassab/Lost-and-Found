import { db } from '@db';
import * as schema from '@shared/schema';
import { eq, and, desc, like, asc, or, not } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import type { ProductInsert } from '../shared/schema';

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

export const getCategoryById = async (id: number) => {
  return await db.query.categories.findFirst({
    where: eq(schema.categories.id, id),
  });
};

export const createCategory = async (data: schema.CategoryInsert) => {
  try {
    // Check if category with same name or slug exists
    const existingCategory = await db.query.categories.findFirst({
      where: or(
        eq(schema.categories.name, data.name),
        eq(schema.categories.slug, data.slug)
      ),
    });

    if (existingCategory) {
      throw new Error("Une catégorie avec ce nom ou ce slug existe déjà.");
    }

    // Insert the category and get the result
    const result = await db.insert(schema.categories).values(data);
    
    // Get the created category
    const category = await db.query.categories.findFirst({
      where: eq(schema.categories.slug, data.slug)
    });

    if (!category) {
      throw new Error("Failed to create category");
    }

    return category;
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error(`Error creating category: ${error.message}`);
  }
};

export const updateCategory = async (id: number, data: Partial<schema.CategoryInsert>) => {
  try {
    // Check if category with same name or slug exists (excluding current category)
    if (data.name || data.slug) {
      const existingCategory = await db.query.categories.findFirst({
        where: and(
          or(
            eq(schema.categories.name, data.name || ""),
            eq(schema.categories.slug, data.slug || "")
          ),
          not(eq(schema.categories.id, id))
        ),
      });

      if (existingCategory) {
        throw new Error("Une catégorie avec ce nom ou ce slug existe déjà.");
      }
    }

    await db
    .update(schema.categories)
    .set(data)
      .where(eq(schema.categories.id, id));

    const category = await db.query.categories.findFirst({
      where: eq(schema.categories.id, id),
    });
  return category;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (id: number) => {
  try {
    // Get the category before deletion
    const category = await db.query.categories.findFirst({
      where: eq(schema.categories.id, id)
    });

    if (!category) {
      throw new Error("Catégorie non trouvée");
    }

    // Delete the category
    await db.delete(schema.categories)
      .where(eq(schema.categories.id, id));

  return category;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
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

export async function createProduct(data: ProductInsert) {
  try {
    console.log('Creating product with data:', data);
    
    // Check if product with same name or slug exists
    const existingProduct = await db.query.products.findFirst({
      where: or(
        eq(schema.products.name, data.name),
        eq(schema.products.slug, data.slug)
      ),
    });

    if (existingProduct) {
      throw new Error("Un produit avec ce nom ou ce slug existe déjà.");
    }

    // Validate category exists
    const category = await db.query.categories.findFirst({
      where: eq(schema.categories.id, data.categoryId),
    });

    if (!category) {
      throw new Error("La catégorie sélectionnée n'existe pas.");
    }
    
    // Stringify the sizes array before saving
    const productData = {
      ...data,
      sizes: JSON.stringify(data.sizes)
    };
    
    console.log('Formatted product data:', productData);

    // Insert the product
    await db.insert(schema.products).values(productData);
    
    // Get the created product
    const createdProduct = await db.query.products.findFirst({
      where: eq(schema.products.slug, data.slug),
      with: {
        category: true,
      },
    });
    
    if (!createdProduct) {
      throw new Error("Failed to create product");
    }
    
    console.log('Created product:', createdProduct);
    return createdProduct;
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error(`Error creating product: ${error.message}`);
  }
}

export async function updateProduct(id: number, data: Partial<ProductInsert>) {
  try {
    // Check if product with same name or slug exists (excluding current product)
    if (data.name || data.slug) {
      const existingProduct = await db.query.products.findFirst({
        where: and(
          or(
            eq(schema.products.name, data.name || ""),
            eq(schema.products.slug, data.slug || "")
          ),
          not(eq(schema.products.id, id))
        ),
      });

      if (existingProduct) {
        throw new Error("Un produit avec ce nom ou ce slug existe déjà.");
      }
    }

    // Validate category exists if being updated
    if (data.categoryId) {
      const category = await db.query.categories.findFirst({
        where: eq(schema.categories.id, data.categoryId),
      });

      if (!category) {
        throw new Error("La catégorie sélectionnée n'existe pas.");
      }
    }

    // Stringify the sizes array if it exists in the update data
    const productData = {
      ...data,
      sizes: data.sizes ? JSON.stringify(data.sizes) : undefined
    };

    await db
    .update(schema.products)
      .set(productData)
      .where(eq(schema.products.id, id));

    // Get the updated product
    const updatedProduct = await db.query.products.findFirst({
      where: eq(schema.products.id, id),
      with: {
        category: true,
      },
    });

    return updatedProduct;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

export const deleteProduct = async (id: number) => {
  try {
    // Get the product before deletion
    const product = await db.query.products.findFirst({
      where: eq(schema.products.id, id)
    });

    if (!product) {
      throw new Error("Produit non trouvé");
    }

    // Use a transaction to ensure both deletions succeed or fail together
    await db.transaction(async (tx) => {
      // First delete any related order items
      await tx.delete(schema.orderItems)
        .where(eq(schema.orderItems.productId, id));

      // Then delete the product
      await tx.delete(schema.products)
        .where(eq(schema.products.id, id));
    });

  return product;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting product:", error.message);
      if (error.stack) console.error(error.stack);
      // Check for MySQL foreign key or constraint errors
      if (error.message.includes('foreign key') || error.message.includes('constraint')) {
        throw new Error("Impossible de supprimer ce produit car il est lié à d'autres données (commandes, etc.)");
      }
    } else {
      console.error("Unknown error deleting product:", error);
    }
    throw error;
  }
};

// Users
export const getUserByUsername = async (username: string) => {
  return await db.query.users.findFirst({
    where: eq(schema.users.username, username),
  });
};

export const createUser = async (data: schema.UserInsert) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  await db.insert(schema.users).values({
      ...data,
      password: hashedPassword,
  });
  
  // Get the inserted user
  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, data.username),
  });
  
  return user;
};

// Orders
export const createOrder = async (
  orderData: Omit<schema.OrderInsert, 'id'>,
  orderItems: Omit<schema.OrderItemInsert, 'id' | 'orderId'>[]
) => {
  // Insert the order
  await db.insert(schema.orders).values(orderData);
  
  // Get the inserted order
  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.customerEmail, orderData.customerEmail),
    orderBy: desc(schema.orders.createdAt)
  });

  if (!order) {
    throw new Error("Failed to create order");
  }

  // Insert order items
  const itemsWithOrderId = orderItems.map((item) => ({
    ...item,
    orderId: order.id,
  }));

  await db.insert(schema.orderItems).values(itemsWithOrderId);

  // Get the complete order with items
  const completeOrder = await db.query.orders.findFirst({
    where: eq(schema.orders.id, order.id),
    with: {
      items: {
        with: {
          product: true,
        },
      },
    },
  });

  return completeOrder;
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
  await db
    .update(schema.orders)
    .set({ status })
    .where(eq(schema.orders.id, id));

  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.id, id),
  });
  return order;
};

export const deleteOrder = async (id: number) => {
  // Delete order items first (to respect foreign key constraints)
  await db.delete(schema.orderItems).where(eq(schema.orderItems.orderId, id));
  // Then delete the order itself
  const deleted = await db.delete(schema.orders).where(eq(schema.orders.id, id));
  return deleted;
};

// Subscribers
export const addSubscriber = async (email: string) => {
  try {
    await db
      .insert(schema.subscribers)
      .values({ email });

    const subscriber = await db.query.subscribers.findFirst({
      where: eq(schema.subscribers.email, email),
    });
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
  
  // Add shipping cost if total is less than 500 MAD
  if (total < 500) {
    total += 50;
  }
  
  return total;
};

// Check if shipping is free
export const isShippingFree = (total: number) => {
  return total >= 500;
};

// Create admin user if it doesn't exist
export const ensureAdminUser = async () => {
  const existingAdmin = await db.query.users.findFirst({
    where: eq(schema.users.username, "admin")
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.insert(schema.users).values({
      username: "admin",
      email: "admin@streetstylecentral.com",
      password: hashedPassword,
      isAdmin: true
    });
    console.log("✅ Admin user created");
  }
};

// Messages
export const createMessage = async (data: schema.MessageInsert) => {
  try {
    const result = await db.insert(schema.messages).values(data);
    const message = await db.query.messages.findFirst({
      where: eq(schema.messages.email, data.email),
      orderBy: desc(schema.messages.createdAt)
    });
    return message;
  } catch (error) {
    console.error("Error creating message:", error);
    throw new Error(`Error creating message: ${error.message}`);
  }
};

export const getAllMessages = async () => {
  return await db.query.messages.findMany({ orderBy: desc(schema.messages.createdAt) });
};

export const deleteMessage = async (id: number) => {
  try {
    console.log('Attempting to delete message with ID:', id);
    
    // Get the message before deletion
    const message = await db.query.messages.findFirst({
      where: eq(schema.messages.id, id)
    });

    console.log('Found message to delete:', message);

    if (!message) {
      console.log('No message found with ID:', id);
      return null;
    }

    // Delete the message
    const deleteResult = await db.delete(schema.messages)
      .where(eq(schema.messages.id, id));
    
    console.log('Delete operation result:', deleteResult);

    // Verify deletion
    const verifyDeletion = await db.query.messages.findFirst({
      where: eq(schema.messages.id, id)
    });
    
    console.log('Verification after deletion:', verifyDeletion);

    return message;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};
