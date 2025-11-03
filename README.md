# 🏡 Apartly API

Apartly API is a RESTful backend built with **Node.js**, **Express + Typescript**, and **MongoDB** for managing apartment listings, users, landlords, tenants, and reviews.

It powers the [Apartly Client](https://github.com/zetmosoma10/apartly-client) frontend and provides secure endpoints for authentication, apartment management, filtering, and user interactions.

## 🚀 Features

- **User Roles** – Tenant, Landlord, and Admin
- **Apartment Management** – Create, update, delete, and view apartments
- **Advanced Filtering** – Search, sort, and filter by price, type, and status
- **Image Uploads** – Managed via **Cloudinary**
- **Reviews & Ratings** – Tenants can review and rate apartments
- **JWT Authentication** – Secure route protection and token validation
- **Pagination & Metadata** – Efficient listing responses
- **Mongoose Models** – Clean, modular data structure

## 🛠️ Tech Stack

- **Node.js** + **Express** + **Typescript**
- **MongoDB** + **Mongoose**
- **Cloudinary** for image hosting
- **Zod** for request validation
- **JWT** for authentication

## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
PORT=3000
APARTLY_DATABASE_URL=your_database_uri
CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
APARTLY_JWT_SECRET=your_jwt_secret
APARTLY_JWT_EXP=your_jwt_exp
```

# 1️⃣ Install dependencies

npm install

# 2️⃣ Start the server

npm run dev
