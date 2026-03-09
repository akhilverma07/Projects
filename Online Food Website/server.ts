import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'bitedash-secret-key-123';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Database Setup
  const db = new Database('database.db');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user'
    );

    CREATE TABLE IF NOT EXISTS food_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      category TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total_price REAL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      food_item_id INTEGER,
      quantity INTEGER,
      price REAL,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(food_item_id) REFERENCES food_items(id)
    );
  `);

  // Seed data
  const insertFood = db.prepare('INSERT OR IGNORE INTO food_items (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)');
  const seedItems = [
    // Burgers
    ['Truffle Burger', 'Gourmet beef patty with black truffle aioli and swiss cheese.', 18.50, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', 'Burgers'],
    ['Classic Cheeseburger', 'Angus beef, cheddar, lettuce, tomato, and our secret sauce.', 14.99, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80', 'Burgers'],
    ['Spicy Jalapeño Burger', 'Beef patty with pepper jack cheese and fresh jalapeños.', 16.50, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80', 'Burgers'],
    
    // Pizza
    ['Margherita Pizza', 'Classic Neapolitan pizza with fresh basil and mozzarella.', 14.00, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80', 'Pizza'],
    ['Pepperoni Feast', 'Double pepperoni with a blend of four cheeses.', 16.50, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80', 'Pizza'],
    ['BBQ Chicken Pizza', 'Grilled chicken, red onions, and smoky BBQ sauce.', 17.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', 'Pizza'],
    
    // Japanese / Sushi
    ['Sushi Platter', 'Assorted premium sushi rolls and nigiri.', 24.00, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80', 'Japanese'],
    ['Salmon Sashimi', 'Fresh Atlantic salmon slices served with wasabi.', 19.00, 'https://images.unsplash.com/photo-1534482421-0d45a48a73fe?auto=format&fit=crop&w=800&q=80', 'Japanese'],
    ['Dragon Roll', 'Eel, cucumber, and avocado with unagi sauce.', 21.50, 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=800&q=80', 'Sushi'],
    
    // Pasta
    ['Pasta Carbonara', 'Traditional Roman pasta with guanciale and pecorino.', 16.00, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80', 'Pasta'],
    ['Seafood Linguine', 'Fresh mussels, shrimp, and squid in a garlic white wine sauce.', 22.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', 'Pasta'],
    
    // Salads
    ['Caesar Salad', 'Crisp romaine lettuce with parmesan and garlic croutons.', 11.00, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80', 'Salads'],
    ['Greek Salad', 'Cucumber, tomatoes, olives, and feta cheese with oregano.', 12.50, 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80', 'Salads'],
    
    // Breakfast
    ['Avocado Toast', 'Sourdough bread topped with smashed avocado and poached eggs.', 12.50, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', 'Breakfast'],
    ['Pancake Stack', 'Fluffy pancakes with maple syrup and fresh berries.', 13.00, 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80', 'Breakfast'],
    
    // Steak
    ['Ribeye Steak', '12oz prime ribeye grilled to perfection with garlic butter.', 32.00, 'https://images.unsplash.com/photo-1546248133-12f74457bce3?auto=format&fit=crop&w=800&q=80', 'Steak'],
    ['Filet Mignon', '8oz tenderloin served with red wine reduction.', 38.00, 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80', 'Steak'],
    
    // Seafood
    ['Grilled Salmon', 'Atlantic salmon with roasted vegetables and lemon.', 24.50, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80', 'Seafood'],
    ['Fish and Chips', 'Beer-battered cod with chunky fries and tartar sauce.', 18.00, 'https://images.unsplash.com/photo-1524593689594-aae2f26b75ab?auto=format&fit=crop&w=800&q=80', 'Seafood'],
    
    // Vegan
    ['Quinoa Bowl', 'Roasted sweet potato, kale, and chickpeas with tahini.', 15.00, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80', 'Vegan'],
    ['Vegan Burger', 'Plant-based patty with vegan mayo and avocado.', 16.00, 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&w=800&q=80', 'Vegan'],
    
    // Beverages
    ['Fresh Orange Juice', '100% freshly squeezed oranges.', 6.50, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80', 'Beverages'],
    ['Iced Caramel Latte', 'Espresso with cold milk and caramel syrup.', 5.50, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80', 'Beverages'],
    
    // Desserts
    ['Chocolate Lava Cake', 'Warm chocolate cake with a molten center.', 9.00, 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80', 'Desserts'],
    ['New York Cheesecake', 'Creamy cheesecake with a graham cracker crust.', 8.50, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80', 'Desserts']
  ];

  // Ensure unique names for seeding
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_food_name ON food_items(name)');
  seedItems.forEach(item => insertFood.run(...item));

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
  };

  // API Routes
  app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const role = email === 'admin@bitedash.com' ? 'admin' : 'user';
      const result = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name, email, hashedPassword, role);
      const token = jwt.sign({ id: result.lastInsertRowid, email, role }, JWT_SECRET);
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
      res.json({ user: { id: result.lastInsertRowid, name, email, role } });
    } catch (err: any) {
      res.status(400).json({ error: 'Email already exists' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
  });

  app.get('/api/auth/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.json({ user: null });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(decoded.id) as any;
      res.json({ user });
    } catch (err) {
      res.json({ user: null });
    }
  });

  app.get('/api/menu', (req, res) => {
    const items = db.prepare('SELECT * FROM food_items').all();
    res.json(items);
  });

  app.post('/api/menu', authenticate, isAdmin, (req, res) => {
    try {
      const { name, description, price, image_url, category } = req.body;
      if (!name || price === undefined) {
        return res.status(400).json({ error: 'Name and price are required' });
      }
      const result = db.prepare('INSERT INTO food_items (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)').run(name, description, price, image_url, category);
      res.json({ id: result.lastInsertRowid, name, description, price, image_url, category });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to add item to database' });
    }
  });

  app.put('/api/menu/:id', authenticate, isAdmin, (req, res) => {
    try {
      const { name, description, price, image_url, category } = req.body;
      const id = Number(req.params.id);
      const result = db.prepare('UPDATE food_items SET name = ?, description = ?, price = ?, image_url = ?, category = ? WHERE id = ?').run(name, description, price, image_url, category, id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json({ message: 'Item updated successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update item in database' });
    }
  });

  app.delete('/api/menu/:id', authenticate, isAdmin, (req, res) => {
    const id = Number(req.params.id);
    db.prepare('DELETE FROM food_items WHERE id = ?').run(id);
    res.json({ message: 'Item deleted' });
  });

  app.post('/api/orders', authenticate, (req, res) => {
    const { items, total_price } = req.body;
    const user_id = (req as any).user.id;
    
    const transaction = db.transaction(() => {
      const orderResult = db.prepare('INSERT INTO orders (user_id, total_price) VALUES (?, ?)').run(user_id, total_price);
      const order_id = orderResult.lastInsertRowid;
      
      const insertItem = db.prepare('INSERT INTO order_items (order_id, food_item_id, quantity, price) VALUES (?, ?, ?, ?)');
      for (const item of items) {
        insertItem.run(order_id, item.id, item.quantity, item.price);
      }
      return order_id;
    });

    const orderId = transaction();
    res.json({ orderId });
  });

  app.get('/api/orders', authenticate, (req, res) => {
    const user = (req as any).user;
    let orders;
    if (user.role === 'admin') {
      orders = db.prepare(`
        SELECT o.*, u.name as user_name 
        FROM orders o 
        JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC
      `).all();
    } else {
      orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
    }
    res.json(orders);
  });

  app.get('/api/orders/:id/items', authenticate, (req, res) => {
    const items = db.prepare(`
      SELECT oi.*, fi.name, fi.image_url 
      FROM order_items oi 
      JOIN food_items fi ON oi.food_item_id = fi.id 
      WHERE oi.order_id = ?
    `).all(req.params.id);
    res.json(items);
  });

  app.put('/api/orders/:id/status', authenticate, isAdmin, (req, res) => {
    const { status } = req.body;
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ message: 'Order status updated' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
