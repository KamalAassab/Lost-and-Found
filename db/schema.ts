import { mysqlTable, int, varchar, text, timestamp } from 'drizzle-orm/mysql-core';

export const categories = mysqlTable('categories', {
  id: int('id').primaryKey().autoincrement(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  image: text('image').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Insert default categories
export const defaultCategories = [
  {
    name: 'Hoodies',
    description: 'Stay cozy and stylish with our premium hoodies. Perfect for casual outings and chilly days.',
    image: '/hoodie.jpg'
  },
  {
    name: 'T-shirts',
    description: 'Our comfortable and trendy t-shirts are a must-have for your everyday wardrobe.',
    image: '/tshirt.jpg'
  }
]; 