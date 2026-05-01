# Next.js + Node.js CMS

A full-featured Content Management System with a Next.js 14 frontend and Express.js API backend.

## Features

- 🔐 **Authentication** — JWT-based login, role-based access (admin/editor)
- 📝 **Posts** — Create, edit, delete, publish/draft/archive, categories, SEO fields
- 📄 **Pages** — Standalone pages with content, status, and SEO
- 🖼️ **Media Library** — Upload images/PDFs, copy URLs, delete files
- 🗂️ **Categories** — Organize posts, create/edit/delete
- 👥 **Users** — Admin can manage team members and roles
- ⚙️ **Settings** — Site name, description, URL, posts per page, comments toggle
- 📊 **Dashboard** — Stats overview, recent posts

## Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form
- Axios

**Backend**
- Node.js + Express
- SQLite (better-sqlite3)
- JWT authentication
- Multer (file uploads)
- bcryptjs (password hashing)

---

## Getting Started

### 1. Backend

```bash
cd backend
cp .env.example .env          # Edit as needed
npm install
npm run dev                    # Runs on http://localhost:4000
```

Default admin credentials:
- Email: `admin@example.com`
- Password: `admin123`

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local    # Edit API URL if needed
npm install
npm run dev                          # Runs on http://localhost:3000
```

### 3. Open the app

Visit http://localhost:3000 — you'll be redirected to the login page.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET/POST | /api/posts | List / Create posts |
| GET/PUT/DELETE | /api/posts/:id | Get / Update / Delete post |
| GET/POST | /api/pages | List / Create pages |
| GET/PUT/DELETE | /api/pages/:id | Get / Update / Delete page |
| GET | /api/media | List media |
| POST | /api/media/upload | Upload file |
| DELETE | /api/media/:id | Delete file |
| GET/POST/PUT/DELETE | /api/categories | Manage categories |
| GET/POST/DELETE | /api/tags | Manage tags |
| GET/POST/PUT/DELETE | /api/users | Manage users (admin) |
| GET/PUT | /api/settings | Get / Update settings |
| GET | /api/dashboard/stats | Dashboard statistics |

---

## Project Structure

```
cms/
├── backend/
│   ├── src/
│   │   ├── db/database.js      # SQLite init & schema
│   │   ├── middleware/auth.js  # JWT middleware
│   │   ├── routes/             # API routes
│   │   └── index.js            # Express app entry
│   ├── uploads/                # Uploaded files (auto-created)
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/                # Next.js App Router pages
    │   │   ├── login/
    │   │   └── dashboard/
    │   ├── components/         # Shared components
    │   └── lib/                # API client, auth helpers
    ├── .env.local.example
    └── package.json
```

## Deployment

- **Backend**: Deploy to any Node.js host (Railway, Render, Fly.io). Set env vars.
- **Frontend**: Deploy to Vercel (`vercel deploy`). Set `NEXT_PUBLIC_API_URL` to your backend URL.
- **Database**: SQLite is file-based; for production consider PostgreSQL with Prisma.
