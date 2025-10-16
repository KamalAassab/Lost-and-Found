# 🛍️ LOST & FOUND - Premium Streetwear E-Commerce Platform

<div align="center">

![LOST & FOUND Logo](client/public/logo.png)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**A modern, premium e-commerce platform for streetwear fashion with professional admin dashboard and seamless user experience.**

[🌐 Live Demo](https://lost-and-found-black-rho.vercel.app) • [📖 Documentation](#documentation) • [🚀 Quick Start](#quick-start) • [📧 Contact](#contact)

</div>

---

## ✨ Features

### 🎨 **Frontend Excellence**
- **Modern UI/UX**: Inspired by premium brands like Nike, Zara, and Dior
- **Responsive Design**: Perfect experience across all devices
- **Professional Animations**: Smooth transitions and micro-interactions
- **Dark Theme**: Elegant black/white/red color palette
- **Accessibility**: Full keyboard navigation and ARIA support

### 🛒 **E-Commerce Features**
- **Product Catalog**: Hoodies, T-shirts, and more with detailed filtering
- **Smart Cart**: Animated cart with size selection and quantity management
- **Quick View**: Instant product previews without page reload
- **Wishlist**: Save favorite items for later
- **Guest Checkout**: Seamless purchasing without account creation
- **Order Tracking**: Complete order history and status updates

### 👤 **User Management**
- **Account Dashboard**: Personal information, order history, and wishlist
- **Authentication**: Secure login/signup with password recovery
- **Profile Management**: Update personal details and preferences
- **Order History**: Track all purchases with detailed information

### 🔧 **Admin Dashboard**
- **Product Management**: Full CRUD operations with image uploads
- **Category Management**: Organize products with background images
- **Order Management**: Process orders with status updates
- **User Management**: Monitor and manage customer accounts
- **Analytics Dashboard**: Sales insights and performance metrics
- **Message Center**: Customer support and inquiries

### 🚀 **Technical Features**
- **Performance Optimized**: Lazy loading, skeleton loaders, and caching
- **SEO Ready**: Meta tags, structured data, and search optimization
- **Security**: Input validation, XSS protection, and secure authentication
- **Scalable Architecture**: Modular design for easy maintenance
- **Real-time Updates**: Live notifications and status changes

---

## 🏗️ Architecture

### **Frontend Stack**
```
React 18 + TypeScript + Tailwind CSS
├── 🎨 UI Components (Shadcn UI + Radix UI)
├── 🔄 State Management (React Query + Context)
├── 🎭 Animations (Framer Motion + CSS Transitions)
├── 📱 Responsive Design (Mobile-First)
└── ♿ Accessibility (ARIA + Keyboard Navigation)
```

### **Backend Stack**
```
Node.js + Express.js + TypeScript
├── 🗄️ Database (MySQL + Drizzle ORM)
├── 🔐 Authentication (Session-based + bcrypt)
├── 📁 File Upload (Multer + Image Processing)
├── 🛡️ Security (CORS + Helmet + Rate Limiting)
└── 📊 API (RESTful + Error Handling)
```

### **Database Schema**
```sql
📦 Products Table
├── id, name, slug, description
├── image, price, oldPrice, category
├── sizes, featured, createdAt

👥 Users Table  
├── id, username, email, password
├── phone, address, fullname, city
├── postalCode, isAdmin, createdAt

🛒 Orders Table
├── id, customerName, customerEmail
├── customerPhone, shippingAddress
├── city, postalCode, items, total
├── status, paymentMethod, createdAt

📂 Categories Table
├── id, name, slug, description
└── backgroundImageUrl

💬 Messages Table
├── id, name, email, message
└── createdAt
```

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- MySQL 8.0+
- Git

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/KamalAassab/Lost-and-Found.git
cd Lost-and-Found
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
# Copy environment template
cp .env.example .env

# Configure your environment variables
DATABASE_URL="mysql://username:password@localhost:3306/lost_and_found"
JWT_SECRET="your-secret-key"
SESSION_SECRET="your-session-secret"
```

4. **Database setup**
```bash
# Run database migrations
npm run db:push

# Seed the database with sample data
npm run db:seed
```

5. **Start development server**
```bash
npm run dev
```

6. **Access the application**
- **Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin
- **API**: http://localhost:5000/api

---

## 📁 Project Structure

```
LOST & FOUND/
├── 📱 client/                    # Frontend React Application
│   ├── 🎨 src/
│   │   ├── components/           # Reusable UI Components
│   │   │   ├── ui/              # Shadcn UI Components
│   │   │   ├── admin/           # Admin-specific Components
│   │   │   ├── home/            # Homepage Components
│   │   │   ├── checkout/        # Checkout Components
│   │   │   └── product/         # Product Components
│   │   ├── pages/               # Main Application Pages
│   │   │   ├── admin/           # Admin Dashboard Pages
│   │   │   └── ...              # User-facing Pages
│   │   ├── layouts/             # Layout Wrappers
│   │   ├── context/             # React Context Providers
│   │   ├── hooks/               # Custom React Hooks
│   │   ├── lib/                 # Utilities and Helpers
│   │   └── index.css            # Global Styles
│   └── 🖼️ public/               # Static Assets
│       ├── logo.png            # Brand Logo
│       ├── banner.jpg          # Hero Banner
│       ├── hoodie.jpg          # Category Images
│       └── tshirt.jpg          # Category Images
├── 🖥️ server/                   # Backend Express Server
│   ├── index.ts                # Server Entry Point
│   ├── routes.ts               # API Routes
│   ├── storage.ts              # Database Logic
│   ├── vite.ts                 # Vite Integration
│   └── middleware.ts            # Express Middleware
├── 🗄️ db/                       # Database Layer
│   ├── index.ts                # Database Connection
│   ├── schema.ts               # Drizzle Schema
│   ├── seed.ts                 # Sample Data
│   └── run-migration.ts        # Migration Runner
├── 🔗 shared/                   # Shared Types & Utilities
│   └── schema.ts               # Shared TypeScript Types
├── 📁 public/                   # Server Public Assets
│   └── uploads/                # User-uploaded Images
├── 📄 package.json             # Project Dependencies
├── ⚙️ tsconfig.json             # TypeScript Configuration
├── 🎨 tailwind.config.js        # Tailwind CSS Config
└── 📖 README.md                # Project Documentation
```

---

## 🛠️ Development

### **Available Scripts**

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Database
npm run db:push        # Push schema changes to database
npm run db:seed          # Seed database with sample data
npm run db:studio         # Open database studio

# Testing
npm test                 # Run unit tests
npm run test:e2e         # Run end-to-end tests
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # TypeScript type checking
```

### **Database Commands**

```bash
# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Reset database
npm run db:reset

# Seed with sample data
npm run db:seed
```

---

## 🎨 UI Components

### **Shadcn UI Components Used**
- **Layout**: Card, Sheet, Dialog, Tabs, Separator
- **Forms**: Input, Button, Select, Checkbox, Textarea
- **Data Display**: Table, Badge, Avatar, Progress
- **Feedback**: Toast, Alert, Skeleton
- **Navigation**: Breadcrumb, Pagination

### **Custom Components**
- **ShopLogo**: Brand logo component
- **ProductCard**: Product display with animations
- **CategoryCard**: Category showcase with images
- **ProfessionalLoader**: Loading states
- **AuthPopup**: Authentication modal

---

## 🔐 Authentication & Security

### **User Authentication**
- Session-based authentication
- Password hashing with bcrypt
- Secure password recovery
- Admin role management

### **Security Features**
- Input validation and sanitization
- XSS protection
- CSRF protection
- Rate limiting
- Secure headers

---

## 📊 Admin Dashboard

### **Dashboard Features**
- **Analytics**: Sales metrics and performance insights
- **Product Management**: Add, edit, delete products with images
- **Category Management**: Organize products with background images
- **Order Processing**: Update order status and track shipments
- **User Management**: Monitor customer accounts
- **Message Center**: Handle customer inquiries

### **Admin Capabilities**
- Full CRUD operations on all entities
- Bulk operations and data export
- Real-time notifications
- Advanced filtering and search
- Professional UI with animations

---

## 🚀 Deployment

### **Production Build**
```bash
npm run build
```

### **Environment Variables**
```env
# Database
DATABASE_URL="mysql://user:pass@host:port/database"

# Security
JWT_SECRET="your-jwt-secret"
SESSION_SECRET="your-session-secret"

# Server
PORT=5000
NODE_ENV=production
```

### **Deployment Platforms**
- **Vercel**: Frontend deployment
- **Railway**: Backend and database
- **PlanetScale**: MySQL database
- **Cloudinary**: Image storage

---

## 🧪 Testing

### **Test Coverage**
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user journey testing
- **Performance Tests**: Load and stress testing

### **Running Tests**
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

---

## 📈 Performance

### **Optimization Features**
- **Lazy Loading**: Components and images
- **Code Splitting**: Route-based splitting
- **Caching**: API response caching
- **Image Optimization**: WebP format support
- **Bundle Analysis**: Webpack bundle analyzer

### **Performance Metrics**
- **Lighthouse Score**: 95+ across all categories
- **Core Web Vitals**: Excellent performance
- **Load Time**: < 2 seconds
- **Bundle Size**: Optimized for production

---

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### **Code Standards**
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Conventional commits for changelog

---

## 📞 Support & Contact

### **Project Lead**
- **Name**: AASSAB Kamal
- **Email**: kamalaassab2002@gmail.com
- **GitHub**: [@KamalAassab](https://github.com/KamalAassab)

### **Documentation**
- **API Docs**: Available in `/docs` folder
- **Component Docs**: Storybook integration
- **Database Schema**: ERD diagrams included

### **Community**
- **Issues**: [GitHub Issues](https://github.com/KamalAassab/Lost-and-Found/issues)
- **Discussions**: [GitHub Discussions](https://github.com/KamalAassab/Lost-and-Found/discussions)
- **Wiki**: [Project Wiki](https://github.com/KamalAassab/Lost-and-Found/wiki)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Design Inspiration**: Nike, Zara, Dior
- **UI Framework**: Shadcn UI, Radix UI
- **Icons**: Lucide React
- **Database**: Drizzle ORM
- **Community**: React and TypeScript communities

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/KamalAassab/Lost-and-Found?style=social)](https://github.com/KamalAassab/Lost-and-Found/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/KamalAassab/Lost-and-Found?style=social)](https://github.com/KamalAassab/Lost-and-Found/network)
[![GitHub issues](https://img.shields.io/github/issues/KamalAassab/Lost-and-Found)](https://github.com/KamalAassab/Lost-and-Found/issues)

**Made with ❤️ by [AASSAB Kamal](https://github.com/KamalAassab)**

</div>