# DevConnect

DevConnect is a full-stack social networking platform where users can create accounts, share posts, interact with other users, and build connections through likes, comments, and follow relationships.

---

## 🚀 Features

### 🔐 Authentication

- User registration
- User login
- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes using JWT Guards
- Access token management

### 👤 User System

- User profile pages
- View user information
- User profile statistics
- Search users by name
- Navigate from search results to user profiles

### 📝 Post System

- Create and view posts
- Display post title and content
- Display post author information
- Display post creation date
- View total likes and comments for each post

### ❤️ Like System

- Like posts
- Unlike posts
- Prevent duplicate likes using a unique database constraint
- Track total likes for each post

### 💬 Comment System

- Add comments to posts
- View comments
- Display comment author information
- Display comment creation date
- Edit comments
- Delete comments
- Protected comment actions for authenticated users

### 👥 Follow System

- Follow other users
- Unfollow users
- Track followers
- Track following
- Display follower and following statistics
- Prevent duplicate follow relationships using a unique database constraint

### 👤 Profile System

Each user has a dedicated profile page that displays:

- User name
- User email
- User avatar
- User posts
- Total posts
- Total comments
- Total likes
- Total followers
- Total following

Users can also follow or unfollow other users directly from their profile.

---

## 🛠️ Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Passport
- bcrypt
- RESTful API

### Database

- PostgreSQL
- Prisma ORM

---

## 📂 Project Structure

### Frontend

```text
app/
├── page.tsx
├── login/
├── register/
└── profile/
    └── [id]/
        └── page.tsx

components/
├── Navbar.tsx
├── PostCard.tsx
└── CommentSection.tsx


## ⚙️ Backend
