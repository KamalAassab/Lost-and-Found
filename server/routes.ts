import type { Express } from "express";
import { createServer, type Server } from "http";
import * as storage from "./storage";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import session from "express-session";
import pgSessionStore from "connect-pg-simple";
import { pool } from "../db";
import * as schema from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "lost_and_found_secret_key";
const PgSession = pgSessionStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware for admin authentication
  app.use(
    session({
      store: new PgSession({
        pool: pool as any,
        tableName: "session",
        createTableIfMissing: true,
      }),
      secret: JWT_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  // Authentication middleware for admin routes
  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.session.user || !req.session.user.isAdmin) {
      return res.status(401).json({ message: "Non autorisé" });
    }
    next();
  };

  // API Routes
  const apiPrefix = "/api";

  // Category routes
  app.get(`${apiPrefix}/categories`, async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des catégories" });
    }
  });

  app.get(`${apiPrefix}/categories/:slug`, async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de la catégorie" });
    }
  });

  app.post(`${apiPrefix}/categories`, requireAdmin, async (req, res) => {
    try {
      const data = schema.categoriesInsertSchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Erreur lors de la création de la catégorie" });
    }
  });

  app.put(`${apiPrefix}/categories/:id`, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = schema.categoriesInsertSchema.parse(req.body);
      const category = await storage.updateCategory(id, data);
      if (!category) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour de la catégorie" });
    }
  });

  app.delete(`${apiPrefix}/categories/:id`, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.deleteCategory(id);
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
      const products = await storage.getAllProducts(
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
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du produit" });
    }
  });

  app.post(`${apiPrefix}/products`, requireAdmin, async (req, res) => {
    try {
      const data = schema.productsInsertSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Erreur lors de la création du produit" });
    }
  });

  app.put(`${apiPrefix}/products/:id`, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = schema.productsInsertSchema.parse(req.body);
      const product = await storage.updateProduct(id, data);
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
      const product = await storage.deleteProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }
      res.json({ message: "Produit supprimé avec succès" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Erreur lors de la suppression du produit" });
    }
  });

  // Admin authentication
  app.post(`${apiPrefix}/admin/login`, async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || !user.isAdmin) {
        return res.status(401).json({ message: "Identifiants invalides" });
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Identifiants invalides" });
      }
      
      // Set user session
      (req.session as any).user = {
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

  app.post(`${apiPrefix}/admin/logout`, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erreur lors de la déconnexion" });
      }
      res.json({ message: "Déconnecté avec succès" });
    });
  });

  app.get(`${apiPrefix}/admin/check`, (req: any, res) => {
    if ((req.session as any).user && (req.session as any).user.isAdmin) {
      return res.json({
        authenticated: true,
        user: {
          id: (req.session as any).user.id,
          username: (req.session as any).user.username,
          isAdmin: (req.session as any).user.isAdmin,
        },
      });
    }
    res.json({ authenticated: false });
  });

  // Order routes
  app.post(`${apiPrefix}/orders`, async (req, res) => {
    try {
      const checkoutData = schema.checkoutSchema.parse(req.body);
      
      // Get product details to verify prices and categories
      const productIds = checkoutData.items.map(item => item.productId);
      const products = await Promise.all(
        productIds.map(id => storage.getProductById(id))
      );
      
      // Prepare items with product categories
      const itemsWithCategories = checkoutData.items.map(item => {
        const product = products.find(p => p && p.id === item.productId);
        if (!product) {
          throw new Error(`Produit non trouvé: ${item.productId}`);
        }
        return {
          ...item,
          category: product.category,
        };
      });
      
      // Apply promotions
      const promotionResult = storage.calculatePromotions(itemsWithCategories);
      
      // Calculate total
      const total = storage.calculateOrderTotal(promotionResult.items);
      
      // Check if free shipping applies
      const freeShipping = storage.isShippingFree(total);
      
      // Create order
      const orderData = {
        customerName: checkoutData.customerName,
        customerEmail: checkoutData.customerEmail,
        customerPhone: checkoutData.customerPhone,
        shippingAddress: checkoutData.shippingAddress,
        city: checkoutData.city,
        postalCode: checkoutData.postalCode,
        paymentMethod: checkoutData.paymentMethod,
        total: total.toString(), // Convert number to string for database compatibility
        freeShipping,
        promoApplied: promotionResult.promoApplied,
      };
      
      // Prepare order items
      const orderItems = promotionResult.items.map(item => {
        const isFree = (item as any).isFree && (item as any).freeCount ? (item as any).freeCount > 0 : false;
        return {
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          price: item.price.toString(), // Convert to string for database compatibility
          isFree,
        };
      });
      
      const order = await storage.createOrder(orderData, orderItems);
      
      res.status(201).json({
        order,
        promoApplied: promotionResult.promoApplied,
        freeHoodiesCount: promotionResult.freeHoodiesCount,
        freeTshirtsCount: promotionResult.freeTshirtsCount,
        freeShipping,
        total,
      });
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
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des commandes" });
    }
  });

  app.get(`${apiPrefix}/orders/:id`, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
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
      
      if (!schema.orderStatusEnum.enumValues.includes(status)) {
        return res.status(400).json({ message: "Statut invalide" });
      }
      
      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour du statut de la commande" });
    }
  });

  // Newsletter subscription
  app.post(`${apiPrefix}/subscribe`, async (req, res) => {
    try {
      const { email } = req.body;
      const validatedEmail = schema.subscribersInsertSchema.parse({ email }).email;
      const result = await storage.addSubscriber(validatedEmail);
      
      if ('error' in result) {
        return res.status(400).json({ message: result.error });
      }
      
      res.status(201).json({ message: "Inscription réussie à la newsletter" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ message: "Erreur lors de l'inscription à la newsletter" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
