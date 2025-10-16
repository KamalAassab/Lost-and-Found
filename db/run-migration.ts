import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../shared/schema';

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'test',
    database: 'ecommerce',
    multipleStatements: true
  });

  const db = drizzle(connection, { schema, mode: 'default' });

  try {
    // First, let's check for any duplicate slugs
    const categories = await db.query.categories.findMany();
    const products = await db.query.products.findMany();
    const users = await db.query.users.findMany();

    // Check for duplicate slugs in categories
    const categorySlugs = new Map();
    const duplicateCategorySlugs = categories.filter(cat => {
      if (categorySlugs.has(cat.slug)) {
        categorySlugs.get(cat.slug).push(cat.id);
        return true;
      }
      categorySlugs.set(cat.slug, [cat.id]);
      return false;
    });

    // Check for duplicate slugs in products
    const productSlugs = new Map();
    const duplicateProductSlugs = products.filter(prod => {
      if (productSlugs.has(prod.slug)) {
        productSlugs.get(prod.slug).push(prod.id);
        return true;
      }
      productSlugs.set(prod.slug, [prod.id]);
      return false;
    });

    // Check for duplicate usernames and emails
    const usernames = new Map();
    const emails = new Map();
    const duplicateUsers = users.filter(user => {
      const hasDuplicateUsername = usernames.has(user.username);
      const hasDuplicateEmail = emails.has(user.email);
      if (hasDuplicateUsername) usernames.get(user.username).push(user.id);
      else usernames.set(user.username, [user.id]);
      if (hasDuplicateEmail) emails.get(user.email).push(user.id);
      else emails.set(user.email, [user.id]);
      return hasDuplicateUsername || hasDuplicateEmail;
    });

    // Log any duplicates found with their IDs
    if (duplicateCategorySlugs.length > 0) {
      console.log('Found duplicate category slugs:');
      for (const [slug, ids] of categorySlugs.entries()) {
        if (ids.length > 1) {
          console.log(`- Slug "${slug}" is used by categories with IDs: ${ids.join(', ')}`);
        }
      }
    }
    if (duplicateProductSlugs.length > 0) {
      console.log('Found duplicate product slugs:');
      for (const [slug, ids] of productSlugs.entries()) {
        if (ids.length > 1) {
          console.log(`- Slug "${slug}" is used by products with IDs: ${ids.join(', ')}`);
        }
      }
    }
    if (duplicateUsers.length > 0) {
      console.log('Found duplicate users:');
      for (const [username, ids] of usernames.entries()) {
        if (ids.length > 1) {
          console.log(`- Username "${username}" is used by users with IDs: ${ids.join(', ')}`);
        }
      }
      for (const [email, ids] of emails.entries()) {
        if (ids.length > 1) {
          console.log(`- Email "${email}" is used by users with IDs: ${ids.join(', ')}`);
        }
      }
    }

    // If no duplicates found, proceed with migration
    if (duplicateCategorySlugs.length === 0 && duplicateProductSlugs.length === 0 && duplicateUsers.length === 0) {
      console.log('No duplicates found. Proceeding with migration...');
      
      // First, update existing payment_method values to match the new enum
      await connection.query(`
        UPDATE orders 
        SET payment_method = CASE 
          WHEN payment_method = 'credit_card' THEN 'credit_card'
          WHEN payment_method = 'debit_card' THEN 'debit_card'
          WHEN payment_method = 'paypal' THEN 'paypal'
          WHEN payment_method = 'bank_transfer' THEN 'bank_transfer'
          ELSE 'credit_card'  -- Default value for any other values
        END
      `);

      // Now run the migration SQL, MySQL compatible, robust to missing columns/constraints
      try {
        await connection.query(`ALTER TABLE \`orders\` MODIFY COLUMN \`payment_method\` ENUM('credit_card', 'debit_card', 'paypal', 'bank_transfer') NOT NULL;`);
      } catch (e) { console.warn('Warning (payment_method):', (e as Error).message); }

      // Remove sensitive payment information from orders table
      for (const col of ['cardNumber', 'expiryDate', 'cardName']) {
        try {
          await connection.query(`ALTER TABLE \`orders\` DROP COLUMN \`${col}\`;`);
        } catch (e) { console.warn(`Warning (drop column ${col}):`, (e as Error).message); }
      }

      // Add proper foreign key constraints
      try {
        await connection.query(`ALTER TABLE \`products\` ADD CONSTRAINT \`products_category_id_fk\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE;`);
      } catch (e) { console.warn('Warning (products_category_id_fk):', (e as Error).message); }
      try {
        await connection.query(`ALTER TABLE \`wishlists\` ADD CONSTRAINT \`wishlists_user_id_fk\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;`);
      } catch (e) { console.warn('Warning (wishlists_user_id_fk):', (e as Error).message); }
      try {
        await connection.query(`ALTER TABLE \`wishlists\` ADD CONSTRAINT \`wishlists_product_id_fk\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;`);
      } catch (e) { console.warn('Warning (wishlists_product_id_fk):', (e as Error).message); }

      // Add unique constraint to prevent duplicate wishlist entries
      try {
        await connection.query(`ALTER TABLE \`wishlists\` ADD CONSTRAINT \`wishlists_user_product_unique\` UNIQUE (\`user_id\`, \`product_id\`);`);
      } catch (e) { console.warn('Warning (wishlists_user_product_unique):', (e as Error).message); }

      // Add indexes for better query performance
      for (const idx of [
        {table: 'order_items', name: 'idx_order_items_order_id', col: 'order_id'},
        {table: 'order_items', name: 'idx_order_items_product_id', col: 'product_id'},
        {table: 'products', name: 'idx_products_category_id', col: 'category_id'},
        {table: 'products', name: 'idx_products_slug', col: 'slug'},
        {table: 'orders', name: 'idx_orders_status', col: 'status'},
        {table: 'orders', name: 'idx_orders_customer_email', col: 'customer_email'}
      ]) {
        try {
          await connection.query(`CREATE INDEX \`${idx.name}\` ON \`${idx.table}\` (\`${idx.col}\`);`);
        } catch (e) { console.warn(`Warning (index ${idx.name}):`, (e as Error).message); }
      }

      // Fix price column type in order_items
      try {
        await connection.query(`ALTER TABLE \`order_items\` MODIFY COLUMN \`price\` DECIMAL(10,2) NOT NULL;`);
      } catch (e) { console.warn('Warning (order_items.price):', (e as Error).message); }

      // Add unique constraints if they don't exist
      for (const unique of [
        {table: 'categories', name: 'categories_slug_unique', col: 'slug'},
        {table: 'products', name: 'products_slug_unique', col: 'slug'},
        {table: 'users', name: 'users_username_unique', col: 'username'},
        {table: 'users', name: 'users_email_unique', col: 'email'}
      ]) {
        try {
          await connection.query(`ALTER TABLE \`${unique.table}\` ADD CONSTRAINT \`${unique.name}\` UNIQUE (\`${unique.col}\`);`);
        } catch (e) { console.warn(`Warning (unique ${unique.name}):`, (e as Error).message); }
      }

      console.log('Migration completed successfully!');
    } else {
      console.log('\nPlease fix the duplicate entries before proceeding with the migration.');
      console.log('You can either:');
      console.log('1. Update the duplicate entries to have unique values');
      console.log('2. Delete the duplicate entries');
      console.log('3. Or if you want to start fresh, you can truncate the tables (this will delete all data)');
    }
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await connection.end();
  }
}

main().catch(console.error); 