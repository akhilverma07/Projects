# SP & Their Sons Shop

A React + Vite ecommerce storefront for SP & Their Sons with Firebase authentication, cart and wishlist support, checkout, user order tracking, and an admin dashboard for products and orders.

## Features

- Customer login and registration with Firebase Authentication
- Default admin account flow for managing the store
- Product listing, product detail pages, cart, and wishlist
- Checkout with delivery details and payment method selection
- Order placement with payment type and payment status
- User dashboard with live order tracking
- Admin dashboard for:
  - adding, editing, and removing products
  - viewing placed orders
  - updating order status
  - tracking new/unread orders
  - viewing sales, expenses, messages, and newsletter signups

## Tech Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS
- Firebase Auth
- Cloud Firestore
- React Router
- Lucide React
- Motion

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The app runs on `http://localhost:3000`.

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

- `npm run dev`: starts the Vite dev server
- `npm run build`: creates the production build
- `npm run preview`: previews the production build locally
- `npm run lint`: runs TypeScript type-checking with `tsc --noEmit`

## Firebase

This project uses Firebase for:

- authentication
- order storage
- product management
- cart and wishlist persistence
- contact and newsletter data

Firebase is initialized in [src/firebase.ts](/Users/akhilverma/Desktop/Projects/sp-&-their-sons---legacy-footwear/src/firebase.ts), and Firestore security rules are defined in [firestore.rules](/Users/akhilverma/Desktop/Projects/sp-&-their-sons---legacy-footwear/firestore.rules).

## Main App Areas

- Home page
- Products page
- Product details
- Cart and checkout
- Wishlist
- User dashboard
- Admin dashboard
- Contact and policy pages

## Project Structure

```text
src/
  components/   Reusable UI components
  context/      Auth, shop, product, and order state
  data/         Static product/category data helpers
  pages/        Route-level screens
  types.ts      Shared TypeScript types
  firebase.ts   Firebase setup and helpers
```

## Notes

- The storefront currently uses a simulated payment selection flow for `UPI`, `Card`, and `Cash on Delivery`.
- The admin dashboard can update order status and track new orders.
- User dashboards show only that signed-in user’s own orders.
