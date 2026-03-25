# MongoDB Compass Setup for All Win Paint Shop

## 1. Connect to MongoDB

### If MongoDB is installed locally (on your PC)

1. Open **MongoDB Compass**.
2. In the **Connection** box, use this URI:
   ```
   mongodb://localhost:27017
   ```
3. Click **Connect**.

### If you use MongoDB Atlas (cloud)

1. Open **MongoDB Compass**.
2. In MongoDB Atlas: **Database** → **Connect** → **Connect using MongoDB Compass**.
3. Copy the connection string shown in Atlas (keep it private).
4. Paste it in Compass and click **Connect**.
5. Replace the `<password>` placeholder in Atlas with your real database password.

---

## 2. Create / use the project database

1. After connecting, you’ll see the list of databases.
2. Click **Create Database** (or **+** next to “Databases”).
3. Enter:
   - **Database Name:** `allwin_paint_shop`
   - **Collection Name:** `users` (you can add more collections later)
4. Click **Create Database**.

Your project uses this database name in `backend\.env`:

```env
MONGODB_URI=mongodb://localhost:27017/allwin_paint_shop
```

So Compass and your app will use the same database.

---

## 3. Collections used by the app

The backend will create these when you run the app and seed script:

| Collection  | Purpose                    |
|------------|----------------------------|
| `users`    | User accounts (owner, manager, buyer) |
| `products` | Products (paints, cement, steel, etc.) |
| `orders`   | Customer orders            |
| `sales`    | Counter sales / bills      |

You don’t need to create them manually; they are created when you:

1. Run **backend**: `npm run dev`
2. Run **seed**: `node seed.js` (from the `backend` folder)

After that, in Compass you’ll see `allwin_paint_shop` and these collections.

---

## 4. Quick check in Compass

1. Connect with: `mongodb://localhost:27017` (local) or your Atlas URI.
2. Open database: **allwin_paint_shop**.
3. After running `node seed.js`, open:
   - **users** → you should see 3 documents (owner, manager, buyer).
   - **products** → you should see 15 sample products.

---

## 5. Connection summary

| Where you set it      | Value |
|-----------------------|--------|
| **Backend** `.env`    | `MONGODB_URI=mongodb://localhost:27017/allwin_paint_shop` |
| **Compass** (local)   | `mongodb://localhost:27017` then select DB `allwin_paint_shop` |
| **Compass** (Atlas)   | Paste the Atlas connection string, then select DB `allwin_paint_shop` |

---

## Troubleshooting

- **“Connection refused” or can’t connect**
  - Start MongoDB service (Windows: **Services** → find **MongoDB** → Start).
  - Or from terminal: `mongod` (if installed without as-service).

- **No database / collections in Compass**
  - Start the backend: `cd backend` → `npm run dev`.
  - Run seed: `node seed.js`.
  - Refresh the database list in Compass (right‑click DB → Refresh).

- **Using Atlas**
  - In Atlas: **Network Access** → add your IP (or `0.0.0.0/0` for testing).
  - In `backend\.env` use your Atlas URI, for example:  
    `MONGODB_URI=YOUR_ATLAS_URI_HERE`
