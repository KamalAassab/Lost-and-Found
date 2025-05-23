import type { Express } from "express";
import { createServer, type Server } from "http";
import * as storageService from "./storage";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import session from "express-session";
import type { Session } from "express-session";
import { db } from "../db";
import * as schema from "@shared/schema";
import express from 'express';
import multer from 'multer';
import path from 'path';
import { requireAdmin } from './middleware';
import { eq, and, desc } from "drizzle-orm";
import { createOrder, isShippingFree } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || "lost_and_found_secret_key";

interface CustomSession extends Session {
  user?: {
    id: number;
    username: string;
    isAdmin: boolean;
  };
}

// Configure multer for file uploads
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: multerStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const { getCategoryById } = storageService;

export async function registerRoutes(app: Express): Promise<Server> {
  // Add express.json() middleware to parse JSON bodies
  app.use(express.json());

  // Use the session middleware with MemoryStore
  app.use(
    session({
      secret: JWT_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production', // true in production, false in development
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' in production, 'lax' in development
        httpOnly: true,
      },
    })
  );

  // API Routes
  const apiPrefix = "/api";

  // Category routes
  app.get(`${apiPrefix}/categories`, async (req, res) => {
    try {
      const categories = await storageService.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des catégories" });
    }
  });

  app.get(`${apiPrefix}/categories/:slug`, async (req, res) => {
    try {
      const category = await storageService.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de la catégorie" });
    }
  });

  app.post(`${apiPrefix}/categories`, requireAdmin, upload.single('backgroundImage'), async (req, res) => {
    try {
      // Get fields from req.body and file from req.file
      const { name, slug, description } = req.body;
      const backgroundImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      // Build the data object for validation and DB
      const data = {
        name,
        slug,
        description,
        backgroundImageUrl
      };

      // Validate (if your schema allows backgroundImageUrl, otherwise add it)
      // If not, remove validation for now and add it to your schema later
      // const validData = schema.categoriesInsertSchema.parse(data);

      const category = await storageService.createCategory(data);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Erreur lors de la création de la catégorie" });
    }
  });

  app.put(`${apiPrefix}/categories/:id`, requireAdmin, upload.single('backgroundImage'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the current category to ensure we have all fields
      const currentCategory = await getCategoryById(id);
      if (!currentCategory) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }

      // Build update data with current values as fallback
      const data = {
        name: req.body.name || currentCategory.name,
        slug: req.body.slug || currentCategory.slug,
        description: req.body.description || currentCategory.description || "",
        backgroundImageUrl: req.body.backgroundImageUrl || currentCategory.backgroundImageUrl
      };

      // If a new file was uploaded, update the backgroundImageUrl
      if (req.file) {
        data.backgroundImageUrl = `/uploads/${req.file.filename}`;
      }

      // Validate the data
      const validData = schema.categoriesInsertSchema.parse(data);
      
      // Update the category
      const category = await storageService.updateCategory(id, validData);
      if (!category) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }
      
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating category:", error);
      res.status(500).json({ 
        message: "Erreur lors de la mise à jour de la catégorie",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.delete(`${apiPrefix}/categories/:id`, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storageService.deleteCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }
      res.json({ message: "Catégorie supprimée avec succès" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de la catégorie" });
    }
  });

  // Product routes
  app.get(`${apiPrefix}/products`, async (req, res) => {
    try {
      const { category, search, featured } = req.query;
      const products = await storageService.getAllProducts(
        category as string | undefined,
        search as string | undefined,
        featured === "true"
      );
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des produits" });
    }
  });

  app.get(`${apiPrefix}/products/:slug`, async (req, res) => {
    try {
      const product = await storageService.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du produit" });
    }
  });

  app.post(`${apiPrefix}/products`, requireAdmin, upload.single('image'), async (req, res) => {
    try {
      // Extract fields from req.body and file from req.file
      const { name, slug, description, price, oldPrice, category, categoryId, inStock, featured, sizes } = req.body;
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "Image du produit requise." });
      }
      // Build product data
      const productData = {
        name,
        slug,
        description,
        image: file.filename,
        price: price ? Number(price) : undefined,
        oldPrice: oldPrice ? Number(oldPrice) : undefined,
        category,
        categoryId: Number(categoryId),
        inStock: inStock === 'true' || inStock === true,
        featured: featured === 'true' || featured === true,
        sizes: typeof sizes === 'string' ? sizes : JSON.stringify(sizes),
      };
      console.log('Received productData:', productData);
      // Validate and create product
      const data = schema.productsInsertSchema.parse(productData);
      const product = await storageService.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ 
        message: "Erreur lors de la création du produit",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.put(`${apiPrefix}/products/:id`, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = schema.productsInsertSchema.parse(req.body);
      const product = await storageService.updateProduct(id, data);
      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour du produit" });
    }
  });

  app.delete(`${apiPrefix}/products/:id`, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storageService.deleteProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }
      res.json({ message: "Produit supprimé avec succès" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ 
        message: "Erreur lors de la suppression du produit",
        details: error && typeof error === 'object' && 'message' in error ? error.message : JSON.stringify(error)
      });
    }
  });

  // User registration
  app.post(`${apiPrefix}/signup`, async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }
    // Check if username exists
    const existingUser = await db.query.users.findFirst({ where: eq(schema.users.username, username) });
      if (existingUser) {
      return res.status(400).json({ message: "Nom d'utilisateur déjà pris" });
      }
    // Check if email exists
    const existingEmail = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
    if (existingEmail) {
      return res.status(400).json({ message: "Email déjà utilisé" });
      }
    // Hash password and insert
    const hashed = await bcrypt.hash(password, 10);
    await db.insert(schema.users).values({ username, password: hashed, email });
    res.status(201).json({ message: "Compte créé" });
  });

  // Unified login endpoint for both admin and client
  app.post(`${apiPrefix}/login`, async (req: express.Request & { session: CustomSession }, res) => {
    try {
      const { username, password } = req.body;
      const user = await storageService.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Identifiants invalides" });
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Identifiants invalides" });
      }
      
      // Set user session
      req.session.user = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      };
      
      res.json({
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Erreur lors de la connexion" });
    }
  });

  // Remove the old admin login endpoint since we now have a unified one
  // Keep the admin check endpoint for verifying admin status
  app.get(`${apiPrefix}/admin/check`, (req: express.Request & { session: CustomSession }, res) => {
    if (req.session?.user?.isAdmin) {
      return res.json({
        authenticated: true,
        user: {
          id: req.session.user.id,
          username: req.session.user.username,
          isAdmin: req.session.user.isAdmin,
        },
      });
    }
    res.json({ authenticated: false });
  });

  // Order routes
  app.post(`${apiPrefix}/orders`, async (req, res) => {
    try {
      const {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        city,
        postalCode,
        paymentMethod,
        items,
        promoApplied
      } = req.body;
      
      // Calculate total and free_shipping on the backend
      const total = calculateOrderTotal(items || []);
      const free_shipping = isShippingFree(total);

      // Use the createOrder helper to insert the order and items
      const order = await createOrder(
        {
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          city,
          postalCode,
          paymentMethod,
          total,
          free_shipping,
          promoApplied
        },
        items || []
      );

      res.json({ order });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Erreur lors de la création de la commande" });
    }
  });

  app.get(`${apiPrefix}/orders`, requireAdmin, async (req, res) => {
    try {
      const orders = await storageService.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des commandes" });
    }
  });

  app.get(`${apiPrefix}/orders/:id`, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storageService.getOrderById(id);
      if (!order) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de la commande" });
    }
  });

  app.put(`${apiPrefix}/orders/:id/status`, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      console.log('Order status update request:', { id, status });
      
      // Validate status
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Le statut est requis" });
      }
      
      // Validate status value
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
      if (!validStatuses.includes(status as any)) {
        return res.status(400).json({ 
          message: "Statut invalide",
          validStatuses 
        });
      }
      
      // Check if order exists
      const existingOrder = await storageService.getOrderById(id);
      if (!existingOrder) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }
      
      // Update order status
      const order = await storageService.updateOrderStatus(id, status as schema.Order['status']);
      if (!order) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour du statut de la commande", details: error instanceof Error ? error.message : error });
    }
  });

  // Add file upload endpoint
  app.post(`${apiPrefix}/upload`, requireAdmin, upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Return the URL of the uploaded file
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Error uploading file" });
    }
  });

  app.delete(`${apiPrefix}/orders/:id`, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deletedOrder = await storageService.deleteOrder(id);
      if (!deletedOrder) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }
      res.json({ message: "Commande supprimée avec succès" });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de la commande" });
    }
  });

  // --- Wishlist Endpoints ---

  // Get wishlist for logged-in user
  app.get('/api/wishlist', async (req, res) => {
    const userId = (req.session as CustomSession)?.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const wishlist = await db.query.wishlists.findMany({
      where: eq(schema.wishlists.userId, userId),
      with: { product: true }
    });
    res.json(wishlist);
  });

  // Add to wishlist
  app.post('/api/wishlist', async (req, res) => {
    const userId = (req.session as CustomSession)?.user?.id;
    const { productId } = req.body;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    await db.insert(schema.wishlists).values({ userId, productId });
    res.status(201).json({ message: "Added to wishlist" });
  });

  // Remove from wishlist
  app.delete('/api/wishlist/:productId', async (req, res) => {
    const userId = (req.session as CustomSession)?.user?.id;
    const productId = parseInt(req.params.productId);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    await db.delete(schema.wishlists).where(
      and(eq(schema.wishlists.userId, userId), eq(schema.wishlists.productId, productId))
    );
    res.json({ message: "Removed from wishlist" });
  });

  // --- User Info Endpoints ---

  // Get current user info
  app.get('/api/me', async (req, res) => {
    const userId = (req.session as CustomSession)?.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  // Update user info
  app.put('/api/me', async (req, res) => {
    const userId = (req.session as CustomSession)?.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const { username, fullname, phone, address, city, postalCode } = req.body;
    await db.update(schema.users)
      .set({ username, fullname, phone, address, city, postalCode })
      .where(eq(schema.users.id, userId));
    res.json({ message: "User info updated" });
  });

  // Update user password
  app.put('/api/me-password', async (req, res) => {
    try {
      const session = req.session as CustomSession;
      if (!session?.user?.id) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Les deux mots de passe sont requis" });
      }

      // Get user with current password
      const user = await db.query.users.findFirst({ 
        where: eq(schema.users.id, session.user.id)
      });
      
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Mot de passe actuel incorrect" });
      }

      // Check if new password is same as current
      if (currentPassword === newPassword) {
        return res.status(400).json({ error: "Le nouveau mot de passe doit être différent de l'ancien" });
      }

      // Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.update(schema.users)
        .set({ password: hashedPassword })
        .where(eq(schema.users.id, session.user.id));

      res.json({ message: "Mot de passe mis à jour avec succès" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ error: "Erreur lors de la mise à jour du mot de passe" });
    }
  });

  // --- Order History Endpoint ---

  // Get orders for current user
  app.get('/api/my-orders', async (req, res) => {
    const userId = (req.session as CustomSession)?.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
    if (!user) return res.status(404).json({ message: "User not found" });
    // Fetch orders by customerEmail = user.email, and include items and product details
    const orders = await db.query.orders.findMany({
      where: eq(schema.orders.customerEmail, user.email),
      with: {
        items: {
          with: {
            product: true
          }
        }
      },
      orderBy: desc(schema.orders.createdAt)
    });
    res.json(orders);
  });

  // General authentication check for any logged-in user
  app.get('/api/check', (req, res) => {
    if ((req.session as CustomSession)?.user) {
      return res.json({ authenticated: true, user: (req.session as CustomSession).user });
    }
    res.json({ authenticated: false });
  });

  // --- Messages endpoints ---
  app.post(`${apiPrefix}/messages`, async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      // Validate
      const validData = schema.messagesInsertSchema.parse({ name, email, subject, message });
      const saved = await storageService.createMessage(validData);
      res.status(201).json(saved);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      const errMsg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errMsg || "Erreur lors de l'envoi du message" });
    }
  });

  app.get(`${apiPrefix}/messages`, requireAdmin, async (req, res) => {
    try {
      const messages = await storageService.getAllMessages();
      res.json(messages);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errMsg || "Erreur lors de la récupération des messages" });
    }
  });

  app.delete(`${apiPrefix}/messages/:id`, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });
      const deleted = await storageService.deleteMessage(id);
      if (!deleted) return res.status(404).json({ message: "Message non trouvé" });
      res.json({ success: true });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: errMsg || "Erreur lors de la suppression du message" });
    }
  });

  // --- User Admin Endpoints ---

  app.get(`${apiPrefix}/admin/users`, requireAdmin, async (req, res) => {
    try {
      const users = await storageService.getAllUsers();
      // Do NOT send password hashes to the frontend
      const usersWithoutPasswords = users.map(user => {
        // Destructure to omit password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      // Log the specific error details
      if (error instanceof Error) {
        console.error("Detailed user fetch error:", error.message);
        if (error.stack) console.error(error.stack);
      } else {
        console.error("Detailed user fetch error:", error);
      }
      res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
  });

  app.delete(`${apiPrefix}/admin/users/:id`, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID utilisateur invalide" });
      }
      const deletedUser = await storageService.deleteUser(id);
      if (!deletedUser) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      // Do NOT return the password hash of the deleted user
      const { password, ...deletedUserWithoutPassword } = deletedUser;
      res.json({ message: "Utilisateur supprimé avec succès", user: deletedUserWithoutPassword });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ 
        message: "Erreur lors de la suppression de l'utilisateur",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
