# BiteDash Project Documentation

## 1. Project Overview

**Project Name:** BiteDash  
**Type:** Full-stack food ordering platform (React + Firebase, with Node/Express server in repo)  
**Primary Goal:** Allow users to browse menu items, add to cart, place orders, apply as restaurant partners, and manage operations through an admin panel.

### 1.1 Key Modules
- User Authentication (Firebase Auth)
- Menu Management (Firestore)
- Cart + Checkout with delivery details
- Orders Management (User + Admin views)
- Partner Application + Approval workflow
- Role-based admin access (`all` vs `own` scope)

---

## 2. Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4
- **Animations:** `motion`
- **Icons:** `lucide-react`
- **Backend Services:** Firebase Authentication + Cloud Firestore
- **Other in repository:** Node/Express + SQLite server (`server.ts`) for local/server-side API experiments

---

## 3. Features Implemented

### 3.1 Customer Features
- Sign up / Sign in
- Browse categories and food items
- Add/remove/update cart items
- Checkout with delivery recipient details:
  - For myself
  - For someone else
- View order history and status
- Cart auto-clears after logout

### 3.2 Partner Features
- Submit “Become a Partner” form
- Duplicate email detection in partner application
- Success/failure feedback

### 3.3 Admin Features
- Menu CRUD operations
- Order status updates
- Partner applications listing
- Confirm partner and grant restricted admin access

### 3.4 Role Model
- `admin@bitedash.com` => full admin (`adminScope = all`)
- Confirmed partners => restricted admin (`adminScope = own`)
- Normal users => user role

Restricted admin can only manage items created by themselves.

---

## 4. Project Structure

```text
bitedash/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── types.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   └── lib/
│       ├── firebase.ts
│       └── roles.ts
├── server.ts
├── package.json
├── README.md
└── docs/
    └── PROJECT_DOCUMENTATION.md
```

---

## 5. Environment Setup

Create `.env.local` in project root.

### 5.1 Required Variables

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

### 5.2 Optional Variable

```env
VITE_PARTNER_ADMIN_EMAILS=email1@example.com,email2@example.com
```

---

## 6. Firebase Configuration (Step-by-Step)

### Step 1: Create Firebase Project
- Go to Firebase Console
- Click **Add project**
- Enter project name and create

**Screenshot Placeholder:**  
`[Add Screenshot: Firebase project creation screen]`

### Step 2: Add Web App
- Open project settings
- Add Web App (`</>`)
- Copy Firebase config values

**Screenshot Placeholder:**  
`[Add Screenshot: Firebase web app config keys]`

### Step 3: Enable Authentication
- Open **Authentication**
- Go to **Sign-in method**
- Enable **Email/Password**

**Screenshot Placeholder:**  
`[Add Screenshot: Auth provider Email/Password enabled]`

### Step 4: Enable Firestore Database
- Open **Firestore Database**
- Create database
- Choose region

**Screenshot Placeholder:**  
`[Add Screenshot: Firestore database created]`

### Step 5: Create Collections
- `users`
- `menu`
- `orders`
- `partner_applications`

**Screenshot Placeholder:**  
`[Add Screenshot: Firestore collections list]`

---

## 7. Firestore Data Model

### 7.1 `users`
```json
{
  "name": "Akhil Verma",
  "email": "user@example.com",
  "email_lower": "user@example.com",
  "role": "user | admin",
  "admin_scope": "own | all"
}
```

### 7.2 `menu`
```json
{
  "name": "Butter Chicken",
  "description": "Tender chicken in creamy tomato-butter gravy.",
  "price": 14.99,
  "image_url": "https://...",
  "category": "Indian",
  "created_by": "uid123",
  "created_by_name": "Partner Name"
}
```

### 7.3 `orders`
```json
{
  "user_id": "uid123",
  "user_name": "Akhil",
  "items": [{ "id": "menuId", "name": "Item", "price": 10, "quantity": 2 }],
  "total_price": 20,
  "status": "pending | completed | cancelled",
  "delivery_for": "self | other",
  "delivery_details": {
    "recipient_name": "Akhil",
    "address": "Full address",
    "pincode": "560001",
    "mobile": "9999999999"
  },
  "created_at": "ISO Date"
}
```

### 7.4 `partner_applications`
```json
{
  "restaurant_name": "Test Kitchen",
  "contact_name": "Owner Name",
  "email": "partner@example.com",
  "email_lower": "partner@example.com",
  "phone": "9999999999",
  "cuisine": "Indian",
  "status": "new | confirmed | rejected",
  "created_at": "ISO Date",
  "confirmed_at": "ISO Date",
  "confirmed_by": "adminUid"
}
```

---

## 8. Application Workflows

### 8.1 User Signup/Login
1. User signs up with email/password
2. User doc is created in Firestore
3. Role is assigned based on:
   - default admin email
   - approved partner status
   - optional admin email list env

**Screenshot Placeholder:**  
`[Add Screenshot: Signup and login success]`

### 8.2 Browse + Cart
1. User browses categories
2. Adds items to cart
3. Cart persists in localStorage

**Screenshot Placeholder:**  
`[Add Screenshot: Menu with items + cart drawer]`

### 8.3 Checkout with Delivery Details
1. User clicks checkout
2. Delivery modal opens
3. Must fill recipient/address/pincode/mobile
4. Order saved in Firestore

**Screenshot Placeholder:**  
`[Add Screenshot: Delivery details modal and placed order]`

### 8.4 Partner Request
1. User clicks “Become a Partner”
2. Submits form
3. Duplicate email is blocked

**Screenshot Placeholder:**  
`[Add Screenshot: Partner form submit and duplicate email message]`

### 8.5 Admin Partner Approval
1. Admin opens Admin Panel > Partners
2. Views pending partner requests
3. Clicks **Confirm & Grant Access**
4. Partner becomes `admin` with `admin_scope = own`

**Screenshot Placeholder:**  
`[Add Screenshot: Partners tab and confirm action]`

### 8.6 Restricted Partner Menu Access
- Confirmed partner can access admin panel
- Can add/edit/delete only items they created
- Cannot manage items created by others

**Screenshot Placeholder:**  
`[Add Screenshot: Partner admin restricted item management]`

---

## 9. Scripts

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
npm run start
```

---

## 10. Validation & Testing Checklist

Use this checklist before submission:

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore collections created
- [ ] `.env.local` configured
- [ ] User signup/login works
- [ ] Admin login works
- [ ] Menu items visible
- [ ] Checkout saves orders
- [ ] Partner duplicate check works
- [ ] Admin confirms partner
- [ ] Confirmed partner gets restricted admin access
- [ ] Cart clears on logout
- [ ] Footer policy popups work

---

## 11. Troubleshooting

### Issue: Menu items are not visible
- Ensure Firestore `menu` has documents, or use Admin seed action
- Verify Firestore rules allow read access
- Check browser console for Firebase permission errors

### Issue: Partner not getting admin access after confirmation
- Ensure partner request status is `confirmed`
- Ensure `users` doc exists for that email
- Log out and log in again to refresh role in auth context

### Issue: Order not placing
- Check required delivery fields
- Confirm Firestore write permissions for `orders`

---

## 12. Suggested Firestore Rules (Demo Only)

Use strict production rules for deployment. Below is only for development/demo:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Important:** These are permissive rules for testing only.

---

## 13. Submission Screenshot Plan

Add screenshots in this order for your report/PDF:

1. Firebase project created
2. Auth Email/Password enabled
3. Firestore collections
4. `.env.local` setup
5. Signup page
6. Login page
7. Menu page with categories
8. Cart and checkout delivery form
9. Orders page
10. Partner request success
11. Duplicate partner check
12. Admin panel menu
13. Admin orders tab
14. Admin partners tab + confirm
15. Confirmed partner with restricted admin access
16. Footer support + terms/privacy popup

---

## 14. Author Credit

`© 2026 BiteDash Food Delivery. Crafted with flavor by Akhil Verma.`

