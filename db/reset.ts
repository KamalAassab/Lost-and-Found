import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '../shared/schema.ts';

async function resetDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'test',
    multipleStatements: true
  });

  try {
    // Drop and recreate database
    await connection.query('DROP DATABASE IF EXISTS ecommerce');
    await connection.query('CREATE DATABASE ecommerce');
    await connection.query('USE ecommerce');

    // Create tables
    const db = drizzle(connection, { schema, mode: 'default' });
    
    // Create users table with all required fields
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(30),
        address VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // Create other tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        background_image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        image VARCHAR(255) NOT NULL,
        price INT NOT NULL,
        old_price INT,
        category VARCHAR(10) NOT NULL,
        category_id INT NOT NULL,
        in_stock BOOLEAN DEFAULT TRUE NOT NULL,
        sizes VARCHAR(255) NOT NULL,
        featured BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending' NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(255) NOT NULL,
        shipping_address VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        payment_method VARCHAR(20) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        free_shipping BOOLEAN DEFAULT FALSE NOT NULL,
        promo_applied BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        size VARCHAR(10) NOT NULL,
        price INT NOT NULL,
        is_free BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    console.log('✅ Database reset successfully!');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await connection.end();
  }
}

resetDatabase(); 