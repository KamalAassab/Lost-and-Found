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
          imageUrl: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?auto=format&fit=crop&w=600&h=600",
          price: "199.00",
          oldPrice: "249.00",
          category: "hoodie",
          categoryId: hoodieCategory.id,
          sizes: ["S", "M", "L", "XL"],
          featured: true
        },
        {
          name: "Street Grey Hoodie",
          slug: "street-grey-hoodie",
          description: "Hoodie gris urbain avec des détails modernes. Parfait pour un style décontracté au quotidien.",
          imageUrl: "https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=600&h=600",
          price: "199.00",
          oldPrice: "249.00",
          category: "hoodie",
          categoryId: hoodieCategory.id,
          sizes: ["S", "M", "L", "XL"],
          featured: true
        },
        {
          name: "Urban White Hoodie",
          slug: "urban-white-hoodie",
          description: "Hoodie blanc minimaliste avec logo discret. Conçu pour un confort optimal et un style intemporel.",
          imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&h=600",
          price: "199.00",
          oldPrice: "249.00",
          category: "hoodie",
          categoryId: hoodieCategory.id,
          sizes: ["S", "M", "L", "XL"],
          featured: false
        },
        {
          name: "Urban Red Hoodie",
          slug: "urban-red-hoodie",
          description: "Hoodie rouge vif pour ceux qui veulent se démarquer. Coupe moderne et tissu doux.",
          imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&h=600",
          price: "199.00",
          oldPrice: "249.00",
          category: "hoodie",
          categoryId: hoodieCategory.id,
          sizes: ["S", "M", "L", "XL"],
          featured: false
        },
        {
          name: "Vintage Blue Hoodie",
          slug: "vintage-blue-hoodie",
          description: "Hoodie bleu dans un style vintage. Parfait pour créer un look rétro authentique.",
          imageUrl: "https://images.unsplash.com/photo-1551854716-06ad41bcac5d?auto=format&fit=crop&w=600&h=600",
          price: "199.00",
          oldPrice: "249.00",
          category: "hoodie",
          categoryId: hoodieCategory.id,
          sizes: ["S", "M", "L", "XL"],
          featured: false
        },
        {
          name: "Black Logo Hoodie",
          slug: "black-logo-hoodie",
          description: "Hoodie noir élégant avec logo brodé. Matériaux premium pour une durabilité exceptionnelle.",
          imageUrl: "https://images.unsplash.com/photo-1556821835-71aa49e5c9a7?auto=format&fit=crop&w=600&h=600",
          price: "199.00",
          oldPrice: "249.00",
          category: "hoodie",
          categoryId: hoodieCategory.id,
          sizes: ["S", "M", "L", "XL"],
          featured: false
        },
        
        // T-shirts
        {
          name: "Minimal Logo T-Shirt",
          slug: "minimal-logo-tshirt",
          description: "T-shirt blanc avec logo minimaliste. Design simple et élégant pour un style décontracté.",
          imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&h=600",
          price: "120.00",
          oldPrice: "150.00",
          category: "tshirt",
          categoryId: tshirtCategory.id,
          sizes: ["S", "M", "L", "XL"],
          featured: true
        },
        {
          name: "Urban Graphic T-Shirt",
          slug: "urban-graphic-tshirt",
          description: "T-shirt avec graphique urbain unique. Parfait pour afficher votre style personnel.",
          imageUrl: "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?auto=format&fit=crop&w=600&h=600",
          price: "120.00",
          oldPrice: "150.00",
          category: "tshirt",
          categoryId: tshirtCategory.id,
          sizes: ["S", "M", "L", "XL"],
          featured: true
        },
        {
          name: "Black Basic T-Shirt",
          slug: "black-basic-tshirt",
          description: "T-shirt noir basique en coton premium. Un essentiel de la garde-robe.",
          imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&h=600",
          price: "120.00",
          oldPrice: "150.00",
          category: "tshirt",
          categoryId: tshirtCategory.id,
          sizes: ["S", "M", "L", "XL"],
          featured: false
        },
        {
          name: "White Logo T-Shirt",
          slug: "white-logo-tshirt",
          description: "T-shirt blanc avec logo discret. Style épuré pour un look tendance.",
          imageUrl: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=600&h=600",
          price: "120.00",
          oldPrice: "150.00",
          category: "tshirt",
          categoryId: tshirtCategory.id,
          sizes: ["S", "M", "L", "XL"],
          featured: false
        },
        {
          name: "Grey Street T-Shirt",
          slug: "grey-street-tshirt",
          description: "T-shirt gris avec design de rue urbain. Confortable et stylé pour un usage quotidien.",
          imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&h=600",
          price: "120.00",
          oldPrice: "150.00",
          category: "tshirt",
          categoryId: tshirtCategory.id,
          sizes: ["S", "M", "L", "XL"],
          featured: false
        },
        {
          name: "Retro Graphic T-Shirt",
          slug: "retro-graphic-tshirt",
          description: "T-shirt avec graphique rétro inspiré des années 90. Style vintage pour les amateurs de mode.",
          imageUrl: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=600&h=600",
          price: "120.00",
          oldPrice: "150.00",
          category: "tshirt",
          categoryId: tshirtCategory.id,
          sizes: ["S", "M", "L", "XL"],
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
