# LOST & FOUND - Streetwear Ecommerce Platform

---

## 🇬🇧 English

### Overview
LOST & FOUND is a modern, premium ecommerce platform focused on streetwear fashion. Inspired by luxury brands, it offers a seamless shopping experience with a high-end UI/UX, advanced features, and robust backend management.

---

### Features
- **Modern, Responsive UI/UX**: Inspired by Nike, Zara, Dior
- **Product Catalog**: Hoodies, T-shirts, and more
- **Featured Products**: Highlighted with horizontal scroll and micro-interactions
- **Cart & Checkout**: Smooth, animated cart and order flow
- **User Accounts**: Registration, login, dashboard
- **Admin Dashboard**: Product, category, and order management
- **Promotions & Banners**: Dynamic home page banners
- **Quick View**: Product quick view modal
- **Micro-Interactions**: Animations, hover effects, toasts
- **Accessibility & SEO**: Optimized for all users and search engines
- **Multi-language Ready**: Easily extendable

---

### Technologies Used
- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: MySQL (with Drizzle ORM)
- **API**: RESTful endpoints
- **State Management**: React Context, React Query
- **Testing**: Jest, React Testing Library, Cypress (E2E)
- **Other**: Radix UI, Shadcn UI, Vite, ESLint, Prettier

---

### Database Structure
- **Products**: id, name, slug, description, image, price, oldPrice, category, sizes, featured, createdAt
- **Categories**: id, name, slug, description
- **Orders**: id, userId, items, total, status, createdAt
- **Users**: id, username, email, password (hashed), role
- **Admin**: Full CRUD for products, categories, orders

---

### Key Functions & Logic
- **Add to Cart**: Select size, quantity, add/remove items
- **Checkout**: Guest or account, order confirmation, success page
- **Product Filtering**: By category, search, sort
- **Admin Actions**: Add/edit/delete products, manage orders
- **User Dashboard**: View orders, manage account
- **Promotions**: Dynamic banners, discount badges
- **Accessibility**: Keyboard navigation, ARIA labels
- **Performance**: Lazy loading, skeleton loaders

---

### Setup & Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/KamalAassab/lost_and_found.git
   cd lost_and_found
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment variables**
   - Copy `.env.example` to `.env` and fill in your database and secret values.
4. **Database setup**
   - Run migrations and seed data:
     ```bash
     npm run db:push
     npm run db:seed
     ```
5. **Start the development server**
   ```bash
   npm run dev
   ```
6. **Run tests**
   ```bash
   npm test
   # For E2E:
   npm run cypress:open
   ```

---

### Project Structure
- `client/` - Frontend React app
- `server/` - Express backend
- `db/` - Database schema, migrations, seeders
- `shared/` - Shared types and utilities
- `.env.example` - Example environment config

---

### Authors & Contact
- **Project Lead:** AASSAB Kamal
- **Contact:** kamalaassab2002@gmail.com
- **GitHub:** [github.com/KamalAassab/lost_and_found](https://github.com/KamalAassab/lost_and_found)

---

## 🇫🇷 Français

### Présentation
LOST & FOUND est une plateforme e-commerce moderne et premium dédiée au streetwear. Inspirée par les grandes marques de luxe, elle offre une expérience d'achat fluide avec une interface haut de gamme, des fonctionnalités avancées et une gestion robuste du back-office.

---

### Fonctionnalités
- **UI/UX moderne et responsive** : Inspirée de Nike, Zara, Dior
- **Catalogue produits** : Hoodies, T-shirts, etc.
- **Produits en vedette** : Carrousel horizontal avec micro-interactions
- **Panier & Paiement** : Panier animé, tunnel de commande fluide
- **Comptes utilisateurs** : Inscription, connexion, dashboard
- **Admin Dashboard** : Gestion des produits, catégories, commandes
- **Promotions & Bannières** : Bannières dynamiques sur la page d'accueil
- **Quick View** : Aperçu rapide des produits
- **Micro-interactions** : Animations, effets hover, notifications toast
- **Accessibilité & SEO** : Optimisé pour tous et pour le référencement
- **Prêt pour le multilingue** : Facile à étendre

---

### Technologies utilisées
- **Frontend** : React, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend** : Node.js, Express.js
- **Base de données** : MySQL (Drizzle ORM)
- **API** : Endpoints RESTful
- **Gestion d'état** : React Context, React Query
- **Tests** : Jest, React Testing Library, Cypress (E2E)
- **Autres** : Radix UI, Shadcn UI, Vite, ESLint, Prettier

---

### Structure de la base de données
- **Produits** : id, nom, slug, description, image, prix, ancienPrix, catégorie, tailles, vedette, createdAt
- **Catégories** : id, nom, slug, description
- **Commandes** : id, userId, items, total, statut, createdAt
- **Utilisateurs** : id, username, email, mot de passe (hashé), rôle
- **Admin** : CRUD complet sur produits, catégories, commandes

---

### Fonctions & Logique principales
- **Ajout au panier** : Sélection de taille, quantité, ajout/suppression
- **Paiement** : Invité ou compte, confirmation, page de succès
- **Filtrage produits** : Par catégorie, recherche, tri
- **Actions admin** : Ajouter/modifier/supprimer produits, gérer commandes
- **Dashboard utilisateur** : Voir commandes, gérer compte
- **Promotions** : Bannières dynamiques, badges de réduction
- **Accessibilité** : Navigation clavier, labels ARIA
- **Performance** : Lazy loading, skeleton loaders

---

### Installation & Lancement
1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/KamalAassab/lost_and_found.git
   cd lost_and_found
   ```
2. **Installer les dépendances**
   ```bash
   npm install
   ```
3. **Configurer les variables d'environnement**
   - Copier `.env.example` en `.env` et renseigner vos valeurs.
4. **Initialiser la base de données**
   - Lancer les migrations et les seeds :
     ```bash
     npm run db:push
     npm run db:seed
     ```
5. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```
6. **Lancer les tests**
   ```bash
   npm test
   # Pour les E2E :
   npm run cypress:open
   ```

---

### Structure du projet
- `client/` - Application React (frontend)
- `server/` - Backend Express
- `db/` - Schéma, migrations, seeds
- `shared/` - Types et utilitaires partagés
- `.env.example` - Exemple de configuration

---

### Auteurs & Contact
- **Chef de projet :** AASSAB Kamal
- **Contact :** kamalaassab2002@gmail.com
- **GitHub :** [github.com/KamalAassab/lost_and_found](https://github.com/KamalAassab/lost_and_found) 