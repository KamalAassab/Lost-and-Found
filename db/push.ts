import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';
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
    // Check if columns exist before adding them
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'ecommerce' 
      AND TABLE_NAME = 'users'
    `);

    const existingColumns = (columns as any[]).map(col => col.COLUMN_NAME);
    const columnsToAdd = [];

    if (!existingColumns.includes('fullname')) {
      columnsToAdd.push('ADD COLUMN fullname VARCHAR(255)');
    }
    if (!existingColumns.includes('city')) {
      columnsToAdd.push('ADD COLUMN city VARCHAR(255)');
    }
    if (!existingColumns.includes('postal_code')) {
      columnsToAdd.push('ADD COLUMN postal_code VARCHAR(20)');
    }

    if (columnsToAdd.length > 0) {
      await db.execute(sql`
        ALTER TABLE users 
        ${sql.raw(columnsToAdd.join(',\n'))}
      `);
      console.log('Added missing columns to users table');
    }

    // Create tables in the correct order
    await db.execute(sql`CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      background_image_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(30),
      address VARCHAR(255),
      fullname VARCHAR(255),
      city VARCHAR(255),
      postal_code VARCHAR(20),
      password VARCHAR(255) NOT NULL,
      is_admin BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description TEXT NOT NULL,
      image VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      old_price DECIMAL(10,2),
      category VARCHAR(10) NOT NULL,
      category_id INT NOT NULL,
      in_stock BOOLEAN DEFAULT TRUE NOT NULL,
      sizes VARCHAR(255) NOT NULL,
      featured BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending' NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(255) NOT NULL,
      shipping_address VARCHAR(255) NOT NULL,
      city VARCHAR(255) NOT NULL,
      postal_code VARCHAR(20) NOT NULL,
      payment_method ENUM('credit_card', 'debit_card', 'paypal', 'bank_transfer') NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      free_shipping BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      INDEX idx_orders_status (status),
      INDEX idx_orders_customer_email (customer_email)
    )`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      size VARCHAR(10) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      is_free BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
      INDEX idx_order_items_order_id (order_id),
      INDEX idx_order_items_product_id (product_id)
    )`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS wishlists (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
      UNIQUE KEY wishlists_user_product_unique (user_id, product_id)
    )`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS subscribers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);

    await db.execute(sql`CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);

    console.log('Database schema updated successfully!');
  } catch (error) {
    console.error('Error updating database schema:', error);
  } finally {
    await connection.end();
  }
}

main().catch(console.error); 