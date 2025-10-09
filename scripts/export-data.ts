import { db } from "../db/index";
import * as schema from "@shared/schema";
import fs from "fs";
import path from "path";

async function exportData() {
  try {
    console.log("🔄 Exporting data from MySQL database...");

    // Export categories
    const categories = await db.query.categories.findMany();
    console.log(`📁 Found ${categories.length} categories`);

    // Export products
    const products = await db.query.products.findMany();
    console.log(`🛍️ Found ${products.length} products`);

    // Export users (without passwords for security)
    const users = await db.query.users.findMany({
      columns: {
        id: true,
        username: true,
        email: true,
        phone: true,
        address: true,
        fullname: true,
        city: true,
        postal_code: true,
        is_admin: true,
        created_at: true
      }
    });
    console.log(`👥 Found ${users.length} users`);

    // Export orders
    const orders = await db.query.orders.findMany();
    console.log(`📦 Found ${orders.length} orders`);

    // Create export directory
    const exportDir = path.join(process.cwd(), "exported-data");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Write data to JSON files
    fs.writeFileSync(
      path.join(exportDir, "categories.json"),
      JSON.stringify(categories, null, 2)
    );

    fs.writeFileSync(
      path.join(exportDir, "products.json"),
      JSON.stringify(products, null, 2)
    );

    fs.writeFileSync(
      path.join(exportDir, "users.json"),
      JSON.stringify(users, null, 2)
    );

    fs.writeFileSync(
      path.join(exportDir, "orders.json"),
      JSON.stringify(orders, null, 2)
    );

    // Create TypeScript static data file
    const staticDataContent = `// Real data exported from MySQL database
export const staticCategories = ${JSON.stringify(categories, null, 2)};

export const staticProducts = ${JSON.stringify(products, null, 2)};

export const staticUsers = ${JSON.stringify(users, null, 2)};

export const staticOrders = ${JSON.stringify(orders, null, 2)};
`;

    fs.writeFileSync(
      path.join(exportDir, "staticData.ts"),
      staticDataContent
    );

    console.log("✅ Data exported successfully!");
    console.log(`📂 Files saved to: ${exportDir}`);
    console.log("📄 Files created:");
    console.log("  - categories.json");
    console.log("  - products.json");
    console.log("  - users.json");
    console.log("  - orders.json");
    console.log("  - staticData.ts");

    // Copy images
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const clientPublicDir = path.join(process.cwd(), "client", "public");
    
    if (fs.existsSync(uploadsDir)) {
      console.log("🖼️ Copying product images...");
      const imageFiles = fs.readdirSync(uploadsDir);
      
      for (const imageFile of imageFiles) {
        const sourcePath = path.join(uploadsDir, imageFile);
        const destPath = path.join(clientPublicDir, imageFile);
        fs.copyFileSync(sourcePath, destPath);
        console.log(`  ✅ Copied: ${imageFile}`);
      }
      
      console.log(`🖼️ Copied ${imageFiles.length} images to client/public/`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error exporting data:", error);
    process.exit(1);
  }
}

exportData();
