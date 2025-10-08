import { db } from '@db';
import * as schema from '@shared/schema';
import { eq, and, desc, like, asc, or, not } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import type { ProductInsert } from '../shared/schema';

// Categories
export const getAllCategories = async () => {
  return await db.query.categories.findMany({
    columns: {
      id: true,
      name: true,
      slug: true,
      description: true,
      backgroundImageUrl: true,
      createdAt: true,
    },
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
  } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
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
  const conditions = [];

  if (category) {
    conditions.push(eq(schema.products.category, category as 'hoodies' | 'tshirts'));
  }

  if (search) {
    conditions.push(
      or(
        like(schema.products.name, `%${search}%`),
        like(schema.products.description, `%${search}%`)
      )
    );
  }

  if (featured !== undefined) {
    conditions.push(eq(schema.products.featured, featured));
  }

  return await db.query.products.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: desc(schema.products.createdAt),
  });
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
  } catch (error: any) {
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
  } catch (error: any) {
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

    // Delete the product
    await db.delete(schema.products)
      .where(eq(schema.products.id, id));

    return product;
  } catch (error: any) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Users
export const getAllUsers = async () => {
  return await db.query.users.findMany({
    columns: { // Select specific columns to exclude password
      id: true,
      username: true,
      email: true,
      fullname: true, // Assuming fullname exists in your schema
      isAdmin: true,
      createdAt: true,
    },
    orderBy: asc(schema.users.createdAt),
  });
};

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

export const ensureAdminUser = async () => {
  const adminUsername = 'admin'; // Or get from env variables
  const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword'; // Default password

  try {
    const existingAdmin = await getUserByUsername(adminUsername);

    if (!existingAdmin) {
      console.log('Admin user not found, creating...');
      await createUser({
        username: adminUsername,
        email: 'admin@lostandfound.com', // Or another default email
        password: adminPassword,
        isAdmin: true,
      });
      console.log('Admin user created successfully.');
    } else {
       console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Error ensuring admin user:', error);
  }
};

export const deleteUser = async (id: number) => {
  try {
    // Get the user before deletion, explicitly selecting all columns including password
    const userToDelete = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
      columns: { // Explicitly select all columns
        id: true,
        username: true,
        email: true,
        phone: true,
        address: true,
        fullname: true,
        city: true,
        postalCode: true,
        password: true, // Ensure password is selected
        isAdmin: true,
        createdAt: true,
      },
    });

    if (!userToDelete) {
      throw new Error("Utilisateur non trouvé");
    }

    // Delete associated wishlist items first
    await db.delete(schema.wishlists).where(eq(schema.wishlists.userId, id));

    // Now delete the user
    await db.delete(schema.users).where(eq(schema.users.id, id));

    return userToDelete; // Return deleted user info (now guaranteed to have password for destructuring)

  } catch (error: any) {
    console.error("Error deleting user:", error);
    throw error;
  }
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

// Messages
export const isShippingFree = (total: number): boolean => {
  return total >= 500;
};

export const createMessage = async (data: schema.MessageInsert) => {
  try {
    const result = await db.insert(schema.messages).values(data);
    const message = await db.query.messages.findFirst({
      where: eq(schema.messages.email, data.email),
      orderBy: desc(schema.messages.createdAt)
    });
    return message;
  } catch (error: any) {
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
  } catch (error: any) {
    console.error("Error deleting message:", error);
    throw error;
  }
};
