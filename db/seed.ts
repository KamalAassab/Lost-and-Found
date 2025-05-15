import { db } from "./index";
import * as schema from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Create categories
    const existingCategories = await db.query.categories.findMany();
    if (existingCategories.length === 0) {
      console.log("Creating categories...");
      const categoriesData = [
        {
          name: "Hoodies",
          slug: "hoodies",
          description: "Hoodies streetwear premium avec designs urbains"
        },
        {
          name: "T-shirts",
          slug: "tshirts",
          description: "T-shirts streetwear à la mode avec designs uniques"
        }
      ];

      await db.insert(schema.categories).values(categoriesData);
      console.log("✅ Categories created");
    } else {
      console.log("Categories already exist, skipping...");
    }

    // Get categories for references
    const categories = await db.query.categories.findMany();
    const hoodieCategory = categories.find(c => c.slug === "hoodies");
    const tshirtCategory = categories.find(c => c.slug === "tshirts");

    if (!hoodieCategory || !tshirtCategory) {
      throw new Error("Categories not found");
    }

    // Create products
    const existingProducts = await db.query.products.findMany();
    if (existingProducts.length === 0) {
      console.log("Creating products...");
      
      const hoodiesData = [
        {
          name: "Urban Black Hoodie",
          slug: "urban-black-hoodie",
          description: "Hoodie streetwear premium avec un design urbain minimaliste. Fabriqué en coton de haute qualité pour un confort optimal au quotidien.",
          image: "urban-black-hoodie.jpg",
          price: "199.00",
          oldPrice: "249.00",
          category: "hoodies" as const,
          categoryId: hoodieCategory.id,
          sizes: JSON.stringify(["S", "M", "L", "XL"]),
          featured: true
        },
        {
          name: "Street Grey Hoodie",
          slug: "street-grey-hoodie",
          description: "Hoodie gris urbain avec des détails modernes. Parfait pour un style décontracté au quotidien.",
          image: "street-grey-hoodie.jpg",
          price: "199.00",
          oldPrice: "249.00",
          category: "hoodies" as const,
          categoryId: hoodieCategory.id,
          sizes: JSON.stringify(["S", "M", "L", "XL"]),
          featured: true
        },
        {
          name: "Urban White Hoodie",
          slug: "urban-white-hoodie",
          description: "Hoodie blanc minimaliste avec logo discret. Conçu pour un confort optimal et un style intemporel.",
          image: "urban-white-hoodie.jpg",
          price: "199.00",
          oldPrice: "249.00",
          category: "hoodies" as const,
          categoryId: hoodieCategory.id,
          sizes: JSON.stringify(["S", "M", "L", "XL"]),
          featured: false
        },
        {
          name: "Urban Red Hoodie",
          slug: "urban-red-hoodie",
          description: "Hoodie rouge vif pour ceux qui veulent se démarquer. Coupe moderne et tissu doux.",
          image: "urban-red-hoodie.jpg",
          price: "199.00",
          oldPrice: "249.00",
          category: "hoodies",
          categoryId: hoodieCategory.id,
          sizes: JSON.stringify(["S", "M", "L", "XL"]),
          featured: false
        },
        {
          name: "Vintage Blue Hoodie",
          slug: "vintage-blue-hoodie",
          description: "Hoodie bleu dans un style vintage. Parfait pour créer un look rétro authentique.",
          image: "vintage-blue-hoodie.jpg",
          price: "199.00",
          oldPrice: "249.00",
          category: "hoodies",
          categoryId: hoodieCategory.id,
          sizes: JSON.stringify(["S", "M", "L", "XL"]),
          featured: false
        },
        {
          name: "Black Logo Hoodie",
          slug: "black-logo-hoodie",
          description: "Hoodie noir élégant avec logo brodé. Matériaux premium pour une durabilité exceptionnelle.",
          image: "black-logo-hoodie.jpg",
          price: "199.00",
          oldPrice: "249.00",
          category: "hoodies",
          categoryId: hoodieCategory.id,
          sizes: JSON.stringify(["S", "M", "L", "XL"]),
          featured: false
        },
        
        // T-shirts
        {
          name: "Minimal Logo T-Shirt",
          slug: "minimal-logo-tshirt",
          description: "T-shirt blanc avec logo minimaliste. Design simple et élégant pour un style décontracté.",
          image: "minimal-logo-tshirt.jpg",
          price: "120.00",
          oldPrice: "150.00",
          category: "tshirts",
          categoryId: tshirtCategory.id,
          sizes: JSON.stringify(["S", "M", "L", "XL"]),
          featured: true
        },
        {
          name: "Urban Graphic T-Shirt",
          slug: "urban-graphic-tshirt",
          description: "T-shirt avec graphique urbain unique. Parfait pour afficher votre style personnel.",
          image: "urban-graphic-tshirt.jpg",
          price: "120.00",
          oldPrice: "150.00",
          category: "tshirts",
          categoryId: tshirtCategory.id,
          sizes: JSON.stringify(["S", "M", "L", "XL"]),
          featured: true
        },
        {
          name: "Black Basic T-Shirt",
          slug: "black-basic-tshirt",
          description: "T-shirt noir basique en coton premium. Un essentiel de la garde-robe.",
          image: "black-basic-tshirt.jpg",
          price: "120.00",
          oldPrice: "150.00",
          category: "tshirts",
          categoryId: tshirtCategory.id,
          sizes: JSON.stringify(["S", "M", "L", "XL"]),
          featured: false
        },
        {
          name: "White Logo T-Shirt",
          slug: "white-logo-tshirt",
          description: "T-shirt blanc avec logo discret. Style épuré pour un look tendance.",
          image: "white-logo-tshirt.jpg",
          price: "120.00",
          oldPrice: "150.00",
          category: "tshirts",
          categoryId: tshirtCategory.id,
          sizes: JSON.stringify(["S", "M", "L", "XL"]),
          featured: false
        },
        {
          name: "Grey Street T-Shirt",
          slug: "grey-street-tshirt",
          description: "T-shirt gris avec design de rue urbain. Confortable et stylé pour un usage quotidien.",
          image: "grey-street-tshirt.jpg",
          price: "120.00",
          oldPrice: "150.00",
          category: "tshirts",
          categoryId: tshirtCategory.id,
          sizes: JSON.stringify(["S", "M", "L", "XL"]),
          featured: false
        },
        {
          name: "Retro Graphic T-Shirt",
          slug: "retro-graphic-tshirt",
          description: "T-shirt avec graphique rétro inspiré des années 90. Style vintage pour les amateurs de mode.",
          image: "retro-graphic-tshirt.jpg",
          price: "120.00",
          oldPrice: "150.00",
          category: "tshirts",
          categoryId: tshirtCategory.id,
          sizes: JSON.stringify(["S", "M", "L", "XL"]),
          featured: false
        }
      ];

      for (const productData of hoodiesData) {
        await db.insert(schema.products).values(productData);
      }
      console.log("✅ Products created");
    } else {
      console.log("Products already exist, skipping...");
    }

    // Create admin user
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "admin")
    });

    if (!existingAdmin) {
      console.log("Creating admin user...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await db.insert(schema.users).values({
        username: "admin",
        email: "admin@streetstylecentral.com",
        password: hashedPassword,
        isAdmin: true
      });
      console.log("✅ Admin user created");
    } else {
      console.log("Admin user already exists, skipping...");
    }

    console.log("✅ Seeding complete!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seed();
